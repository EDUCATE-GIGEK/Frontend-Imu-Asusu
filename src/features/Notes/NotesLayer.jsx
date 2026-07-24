import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "./useNotes";
import FloatingNote from "./FloatingNote";

// A fixed overlay that hosts floating notes ABOVE a surface (timeline canvas or a
// learning module). It is deliberately its own layer, not a child of the scrolling
// canvas, so dragging a note never fights the canvas pan and note positions stay
// anchored to the screen rather than sliding with the scroll.
//
// The layer itself is pass-through (pointer-events-none); each note re-enables
// pointer events, so the timeline underneath stays clickable between them. Notes
// are added from the entry drawer's "Add Notes" button, not a toolbar here.
//
// Props:
//   contextType  'timeline' | 'learning_module' — which surface this is.
//   contextId    id of the specific group/module the notes belong to.
//   contextText  the surrounding content, passed to AI so it is grounded in
//                wherever the note was taken. (Used by the AI panel, next step.)
//   disabled     test-lock. When a learner is taking a test, notes are hidden.
//                Detection is wired later; the prop is here so callers can gate now.
// Above the entry drawer (z-50) so a note dragged over it stays on top. The layer
// is pass-through, so only the note cards actually cover the drawer — the rest of
// it stays interactive.
const Layer = tw.div`fixed inset-0 z-[60] pointer-events-none`;

export default function NotesLayer({
  contextType,
  contextId,
  contextText,
  focusNoteId = null,
  disabled = false,
}) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const userId = profile?.id;
  const { notes, isLoading, isAnon, saveNote, bumpZ, saveToLibrary, savingId } = useNotes({
    userId,
    contextType,
    contextId,
  });

  // Notes do NOT auto-open when a timeline is visited. A note shows only once it's
  // opened THIS session: a newly added note, or one deep-linked from the library
  // (Edit). Notes that already existed on load stay hidden until then; closing (×)
  // hides one again. Nothing here deletes — see the Notes page for that.
  const [openIds, setOpenIds] = useState(() => new Set());
  const knownIds = useRef(null);
  const closeNote = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.delete(String(id));
      return next;
    });

  // The first loaded snapshot is treated as "already there" (kept closed). Anything
  // that appears afterwards was added this session, so it opens. Exception: a
  // visitor has no notes library to reopen from, so their one draft opens on load
  // rather than sitting hidden until they happen to re-add it.
  useEffect(() => {
    if (isLoading) return;
    if (knownIds.current === null) {
      knownIds.current = new Set(notes.map((n) => String(n.id)));
      if (isAnon && notes.length) {
        setOpenIds((prev) => new Set([...prev, ...notes.map((n) => String(n.id))]));
      }
      return;
    }
    const fresh = [];
    for (const n of notes) {
      const id = String(n.id);
      if (!knownIds.current.has(id)) {
        knownIds.current.add(id);
        fresh.push(id);
      }
    }
    if (fresh.length) setOpenIds((prev) => new Set([...prev, ...fresh]));
  }, [notes, isLoading]);

  // A deep-linked note (Edit from the library) opens and is raised to the top.
  useEffect(() => {
    if (!focusNoteId) return;
    setOpenIds((prev) => new Set(prev).add(String(focusNoteId)));
    const target = notes.find((n) => String(n.id) === String(focusNoteId));
    if (!target) return;
    const top = notes.reduce((m, n) => Math.max(m, n.z_index ?? 0), 0);
    if (target.z_index <= top && notes.length > 1) bumpZ(target.id, top + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNoteId, notes.length]);

  // A signed-out visitor keeps their one free note here too — only a test in
  // progress hides the layer outright.
  if (disabled) return null;

  // Raise a note above the rest on focus so the active one is never buried. This is
  // stacking only, so it goes through bumpZ and never marks a saved note dirty.
  function bringToFront(note) {
    const top = notes.reduce((m, n) => Math.max(m, n.z_index ?? 0), 0);
    if (note.z_index <= top && notes.length > 1) {
      bumpZ(note.id, top + 1);
    }
  }

  return (
    <Layer aria-label="Notes">
      {notes
        .filter((note) => openIds.has(String(note.id)))
        .map((note) => (
          <FloatingNote
            key={note.id}
            note={note}
            contextText={contextText}
            saving={savingId === note.id}
            focused={String(note.id) === String(focusNoteId)}
            onFocus={() => bringToFront(note)}
            onSave={(patch) => saveNote(note.id, patch)}
            // A visitor has no library to save to; saving is the nudge to sign
            // in, after which this note is migrated into their account.
            requiresLogin={isAnon}
            onSaveToLibrary={() => (isAnon ? navigate("/login") : saveToLibrary(note.id))}
            onClose={() => closeNote(note.id)}
          />
        ))}
    </Layer>
  );
}
