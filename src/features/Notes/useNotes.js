import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotes, createNote, updateNote, deleteNote } from "@/services/apiNotes";
import {
  readWorking,
  upsertWorking,
  removeWorking,
  newDraftId,
  isDraftId,
  countAnonWorking,
  ANON_USER,
} from "./draftStore";

// Max notes a user may keep per context (per timeline group / learning module).
// Deliberately a config constant, not a DB constraint — the cap may grow later
// without a migration. Counts drafts and saved notes together.
export const MAX_NOTES_PER_CONTEXT = 10;

// A signed-out visitor gets one note total — a taste of the feature before they
// make an account. The cap is global (not per context) so it can't be sidestepped
// by switching timelines.
export const MAX_ANON_NOTES = 1;

// New notes land slightly offset from the last so a fresh one never lands exactly
// on top of the previous, hiding it.
const NEW_NOTE_ORIGIN = { x: 32, y: 96 };
const NEW_NOTE_STAGGER = 28;

function patchToRow(patch) {
  const row = {};
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.posX !== undefined) row.pos_x = patch.posX;
  if (patch.posY !== undefined) row.pos_y = patch.posY;
  if (patch.zIndex !== undefined) row.z_index = patch.zIndex;
  return row;
}

// The persistable fields of a note, as stored in the working layer.
function workingItemFrom(note) {
  return {
    id: String(note.id),
    body: note.body ?? "",
    pos_x: note.pos_x,
    pos_y: note.pos_y,
    z_index: note.z_index,
    context_type: note.context_type,
    context_id: note.context_id,
    context_label: note.context_label ?? null,
    source_entry_id: note.source_entry_id ?? null,
    source_entry_title: note.source_entry_title ?? null,
    created_at: note.created_at,
  };
}

// Notes for a context come from two layers merged into one list:
//   - saved notes from the DB (status "saved")
//   - the working layer in localStorage: drafts (status "draft") and overlays of
//     unsaved edits onto a saved note (status "saved", dirty true)
// Both flow through the same react-query key, so every consumer (the floating layer
// AND the Timeline page) sees one synced list, and unsaved work survives reload.
//
// Explicit-save model: edits update the WORKING copy only (localStorage + cache).
// saveToLibrary is the one thing that writes to the DB.
export function useNotes({ userId, contextType, contextId }) {
  const queryClient = useQueryClient();
  // A signed-out visitor's notes live under a sentinel user in the same working
  // layer, so all the draft persistence below is unchanged; the DB is simply
  // never touched for them.
  const isAnon = !userId;
  const uid = userId ?? ANON_USER;
  const enabled = Boolean(uid && contextType && contextId);
  const key = ["notes", contextType, contextId, uid];
  const [savingId, setSavingId] = useState(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: key,
    enabled,
    // Unsaved edits live in the working layer, not the DB; don't let a focus refetch
    // reorder or surprise the user mid-edit.
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const saved = isAnon ? [] : await getNotes({ userId, contextType, contextId });
      const working = readWorking(uid, contextType, contextId);
      const savedById = new Map(saved.map((n) => [String(n.id), n]));
      const used = new Set();
      const out = [];

      for (const w of working) {
        if (isDraftId(w.id)) {
          out.push({ ...w, status: "draft" });
        } else {
          const base = savedById.get(String(w.id));
          if (!base) continue; // stale overlay for a deleted note — drop it
          used.add(String(w.id));
          out.push({
            ...base,
            body: w.body,
            pos_x: w.pos_x,
            pos_y: w.pos_y,
            z_index: w.z_index,
            status: "saved",
            dirty: true,
          });
        }
      }
      for (const n of saved) {
        if (!used.has(String(n.id))) out.push({ ...n, status: "saved" });
      }
      return out;
    },
  });

  // A signed-in user's cap is per context; a visitor's is one note across all of
  // them, counted from the working layer directly since they have no query per
  // context to sum.
  const atCapacity = isAnon
    ? countAnonWorking() >= MAX_ANON_NOTES
    : notes.length >= MAX_NOTES_PER_CONTEXT;

  const cachedNote = (id) =>
    (queryClient.getQueryData(key) ?? []).find((n) => String(n.id) === String(id));

  // Create a new working draft (NOT a DB row — that happens on explicit Save). meta
  // records where it came from for a later Save: { contextLabel, sourceEntryId,
  // sourceEntryTitle }.
  function addNote(meta = {}) {
    if (atCapacity) return;
    const step = notes.length;
    const draft = {
      id: newDraftId(),
      body: "",
      pos_x: NEW_NOTE_ORIGIN.x + step * NEW_NOTE_STAGGER,
      pos_y: NEW_NOTE_ORIGIN.y + step * NEW_NOTE_STAGGER,
      z_index: step + 1,
      context_type: contextType,
      context_id: contextId,
      context_label: meta.contextLabel ?? null,
      source_entry_id: meta.sourceEntryId ?? null,
      source_entry_title: meta.sourceEntryTitle ?? null,
      created_at: new Date().toISOString(),
    };
    upsertWorking(uid, contextType, contextId, draft);
    queryClient.setQueryData(key, (old = []) => [...old, { ...draft, status: "draft" }]);
  }

  // Body edits and drag moves. The cache is patched (drafts stay drafts; saved notes
  // become dirty), and the working layer is updated so the edit survives reload.
  function saveNote(id, patch) {
    queryClient.setQueryData(key, (old = []) =>
      old.map((n) =>
        String(n.id) === String(id)
          ? { ...n, ...patchToRow(patch), ...(isDraftId(id) ? {} : { dirty: true }) }
          : n,
      ),
    );
    const updated = cachedNote(id);
    if (updated) upsertWorking(uid, contextType, contextId, workingItemFrom(updated));
  }

  // Stacking order only — purely visual, so it never marks a saved note dirty and
  // isn't persisted for saved notes (drafts persist everything they own).
  function bumpZ(id, zIndex) {
    queryClient.setQueryData(key, (old = []) =>
      old.map((n) => (String(n.id) === String(id) ? { ...n, z_index: zIndex } : n)),
    );
    if (isDraftId(id)) {
      const updated = cachedNote(id);
      if (updated) upsertWorking(uid, contextType, contextId, workingItemFrom(updated));
    }
  }

  // The only path that writes to the DB. A draft is inserted (then removed from the
  // working layer); a dirty saved note is updated (its overlay removed). Ends clean.
  async function saveToLibrary(id) {
    // The library is the account. A visitor has nowhere to save to — the caller
    // sends them to log in instead (their draft is migrated once they do).
    if (isAnon) return;
    const note = cachedNote(id);
    if (!note) return;
    setSavingId(id);
    try {
      if (isDraftId(id)) {
        const row = await createNote({
          userId,
          contextType,
          contextId,
          body: note.body ?? "",
          posX: note.pos_x,
          posY: note.pos_y,
          zIndex: note.z_index,
          contextLabel: note.context_label,
          sourceEntryId: note.source_entry_id,
          sourceEntryTitle: note.source_entry_title,
        });
        removeWorking(uid, contextType, contextId, id);
        queryClient.setQueryData(key, (old = []) => [
          ...old.filter((n) => String(n.id) !== String(id)),
          { ...row, status: "saved" },
        ]);
      } else {
        await updateNote(id, {
          body: note.body,
          posX: note.pos_x,
          posY: note.pos_y,
          zIndex: note.z_index,
        });
        removeWorking(uid, contextType, contextId, id);
        queryClient.setQueryData(key, (old = []) =>
          old.map((n) => (String(n.id) === String(id) ? { ...n, dirty: false } : n)),
        );
      }
    } finally {
      // On failure the working copy is left intact so the user can retry.
      setSavingId(null);
    }
  }

  // Discard a draft, or delete a saved note. Either way its working entry (draft or
  // overlay) is cleared; a saved note is also removed from the DB.
  function removeNote(id) {
    removeWorking(uid, contextType, contextId, id);
    queryClient.setQueryData(key, (old = []) => old.filter((n) => String(n.id) !== String(id)));
    if (!isAnon && !isDraftId(id)) {
      deleteNote(id).catch(() => queryClient.invalidateQueries({ queryKey: key }));
    }
  }

  return {
    notes,
    isLoading,
    atCapacity,
    isAnon,
    addNote,
    saveNote,
    bumpZ,
    saveToLibrary,
    savingId,
    removeNote,
  };
}
