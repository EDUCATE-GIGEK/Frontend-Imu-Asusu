import { useEffect, useRef, useState } from "react";
import tw from "tailwind-styled-components";
import NoteAIPanel from "./NoteAIPanel";

// A single draggable note card. Free-floating: the user positions it anywhere on
// screen. Drag is hand-rolled with pointer events (no dep). Position moves in local
// state during the drag for smoothness and is persisted once on drop; body edits
// are debounced. The card re-enables pointer events over the pass-through NotesLayer.
//
// Given a warm sticky-note tint + border so a note stands out against the white
// timeline rather than blending in (outline over shadow, soft amber not bold orange).
//
// Props:
//   note         the row { id, body, pos_x, pos_y, z_index }.
//   contextText  surrounding surface content, passed to the AI panel for grounding.
//   onSave       (patch) => void — body edits and drag drops flow up to updateNote.
//   onFocus      () => void — bump z-index so the active note sits on top.
//   onClose      () => void — dismiss from the canvas (does NOT delete; the note
//                stays saved in the DB / draft in localStorage).
// A dashed border marks an unsaved note (draft or edited-since-save) at a glance;
// a saved-and-clean note is solid. The header Save button says the same in words.
const Card = tw.div`
  absolute pointer-events-auto bg-orange-background-100 rounded-md flex flex-col font-body border
  ${(p) => (p.$unsaved ? "border-dashed border-orange-300" : "border-solid border-grey-info-outline")}
`;
const Handle = tw.div`
  flex items-center justify-between gap-2 h-9 pl-2.5 pr-1.5 rounded-t-md bg-orange-300/20
  border-b border-grey-info-outline cursor-grab active:cursor-grabbing select-none
`;
const HandleBtns = tw.div`flex items-center gap-0.5`;
const IconBtn = tw.button`
  flex items-center justify-center w-7 h-7 rounded text-[17px] leading-none cursor-pointer
  text-title opacity-55 hover:opacity-100 hover:bg-orange-300/30 transition-colors
`;
const SaveBtn = tw.button`
  text-[11px] font-semibold text-title px-1.5 py-0.5 rounded cursor-pointer
  hover:bg-orange-300/30 disabled:opacity-50 disabled:cursor-default transition-colors
`;
const SavedTag = tw.span`text-[10px] uppercase tracking-wide text-title/40`;
const Body = tw.textarea`
  w-full resize-none px-2.5 py-2 text-[13px] text-title leading-snug
  bg-transparent outline-none rounded-b-md
`;
const UndoBar = tw.div`
  flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px]
  text-title/60 bg-orange-300/15 border-t border-grey-info-outline
`;
const UndoBtn = tw.button`font-semibold text-title/80 hover:text-title underline underline-offset-2 cursor-pointer`;

const BODY_SAVE_DELAY = 600;

// The only two sizes a note takes. Kept here as one constant so both are trivial
// to retune. Width is on the card; height is the body (textarea) height.
const NOTE_SIZE = {
  collapsed: { width: 400, bodyHeight: 280 },
  expanded: { width: 640, bodyHeight: 680 },
};

export default function FloatingNote({
  note,
  contextText,
  saving = false,
  focused = false,
  requiresLogin = false,
  onSave,
  onSaveToLibrary,
  onFocus,
  onClose,
}) {
  const unsaved = note.status === "draft" || note.dirty;
  // Position lives locally during a drag; the row is the source of truth otherwise.
  const [pos, setPos] = useState({ x: note.pos_x, y: note.pos_y });
  const [body, setBody] = useState(note.body ?? "");
  // Expand is ephemeral UI state, not persisted — it's about reading right now.
  const [expanded, setExpanded] = useState(false);
  // The note text from just before an AI "replace", so it can be reverted. Null
  // when there's nothing to undo (cleared on manual edits and on append).
  const [undoBody, setUndoBody] = useState(null);
  // Briefly true right after a successful save, for a "Saved ✓" confirmation.
  const [justSaved, setJustSaved] = useState(false);

  const drag = useRef(null); // { startX, startY, originX, originY } while dragging
  const saveTimer = useRef(null);
  const flashTimer = useRef(null);
  const wasSaving = useRef(false);

  const size = expanded ? NOTE_SIZE.expanded : NOTE_SIZE.collapsed;

  // Re-sync when the row changes underneath us (e.g. a rollback) and we're idle.
  useEffect(() => {
    if (!drag.current) setPos({ x: note.pos_x, y: note.pos_y });
  }, [note.pos_x, note.pos_y]);

  function handlePointerDown(e) {
    // Only the handle drags; ignore its buttons (expand, delete).
    if (e.target.closest("button")) return;
    onFocus?.();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
  }

  function handlePointerMove(e) {
    if (!drag.current) return;
    const { startX, startY, originX, originY } = drag.current;
    setPos({
      x: Math.max(0, originX + (e.clientX - startX)),
      y: Math.max(0, originY + (e.clientY - startY)),
    });
  }

  function handlePointerUp(e) {
    if (!drag.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    // Persist the final resting position once, not every move.
    onSave?.({ posX: pos.x, posY: pos.y });
  }

  function handleBodyChange(e) {
    const value = e.target.value;
    setBody(value);
    // A manual edit supersedes the last AI replace — the old text is no longer a
    // meaningful thing to revert to.
    if (undoBody !== null) setUndoBody(null);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSave?.({ body: value }), BODY_SAVE_DELAY);
  }

  // Flush a pending body save if the card unmounts (e.g. navigating away).
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // Arriving via an Edit deep link opens the note expanded so it's front and centre.
  useEffect(() => {
    if (focused) setExpanded(true);
  }, [focused]);

  // When a save finishes (saving went true → false) and the note is now clean, flash
  // "Saved ✓" for a moment, then fall back to the plain "Saved" tag.
  useEffect(() => {
    if (wasSaving.current && !saving && !unsaved) {
      setJustSaved(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setJustSaved(false), 2000);
    }
    wasSaving.current = saving;
  }, [saving, unsaved]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // Place an AI result into the note. The model decides the action: "replace"
  // swaps the whole note (rewrite/summarize/improve), "append" adds to it (new
  // content/answers). Persist immediately so the edit isn't lost if the debounce
  // timer is mid-flight.
  function applyAIResult(text, action) {
    const replace = action === "replace";
    const next = replace
      ? text
      : body.trim()
        ? `${body.trimEnd()}\n\n${text}`
        : text;
    // Only a replace is destructive, so only a replace offers an undo (to the text
    // as it was right before this call).
    setUndoBody(replace ? body : null);
    setBody(next);
    clearTimeout(saveTimer.current);
    onSave?.({ body: next });
  }

  function undoReplace() {
    if (undoBody === null) return;
    setBody(undoBody);
    clearTimeout(saveTimer.current);
    onSave?.({ body: undoBody });
    setUndoBody(null);
  }

  return (
    <Card
      $unsaved={unsaved}
      style={{ left: pos.x, top: pos.y, zIndex: note.z_index, width: size.width }}
      onPointerDown={onFocus}
    >
      <Handle
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {unsaved ? (
          <SaveBtn type="button" onClick={onSaveToLibrary} disabled={saving}>
            {requiresLogin
              ? "Log in to save"
              : saving
                ? "Saving…"
                : note.status === "draft"
                  ? "Save"
                  : "Save changes"}
          </SaveBtn>
        ) : (
          <SavedTag>{justSaved ? "Saved ✓" : "Saved"}</SavedTag>
        )}
        <HandleBtns>
          <IconBtn
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse note" : "Expand note"}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "⤡" : "⤢"}
          </IconBtn>
          <IconBtn type="button" onClick={onClose} aria-label="Close note" title="Close">
            ×
          </IconBtn>
        </HandleBtns>
      </Handle>
      <Body
        value={body}
        onChange={handleBodyChange}
        placeholder="Write a note…"
        style={{ height: size.bodyHeight }}
      />
      {undoBody !== null && (
        <UndoBar>
          <span>AI replaced your note.</span>
          <UndoBtn type="button" onClick={undoReplace}>
            Undo
          </UndoBtn>
        </UndoBar>
      )}

      <NoteAIPanel body={body} contextText={contextText} onResult={applyAIResult} />
    </Card>
  );
}
