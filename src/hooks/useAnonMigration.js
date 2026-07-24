import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { createManuscript } from "@/services/apiManuscripts";
import { createNote } from "@/services/apiNotes";
import { getAnonManuscript, clearAnonManuscript } from "@/services/anonManuscript";
import { readAllAnonWorking, clearAnonWorking } from "@/features/Notes/draftStore";

// When a visitor who wrote something while signed out logs in, that work moves
// into their account: the anonymous manuscript becomes a real manuscript, and
// each anonymous note becomes a saved note. Runs once per sign-in, then clears
// the local copies so nothing migrates twice or is inherited by the next user
// of a shared machine.
//
// Mounted once, app-wide (AppLayout). A failed step resets the guard so the next
// render retries rather than silently dropping the visitor's work.
export default function useAnonMigration() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const migratedFor = useRef(null);

  useEffect(() => {
    const userId = profile?.id;
    if (!userId || migratedFor.current === userId) return;
    migratedFor.current = userId;

    (async () => {
      let migratedManuscript = false;
      let migratedNotes = false;

      // ── Manuscript ──────────────────────────────────────────────────────────
      const anonMs = getAnonManuscript();
      if (anonMs && (anonMs.title?.trim() || anonMs.description)) {
        try {
          await createManuscript({
            userId,
            title: anonMs.title ?? "",
            manuscriptDescription: anonMs.description ?? "",
            summary: anonMs.summary ?? "",
            contexts: { places: anonMs.places ?? [], peoples: anonMs.peoples ?? [] },
            educationLevel: anonMs.educationLevel || null,
            isPublic: false, // sharing is an account choice, made after it lands
          });
          clearAnonManuscript();
          migratedManuscript = true;
        } catch {
          migratedFor.current = null; // retry on a later render
        }
      } else if (anonMs) {
        clearAnonManuscript(); // an empty shell — nothing worth keeping
      }

      // ── Notes ───────────────────────────────────────────────────────────────
      const anonNotes = readAllAnonWorking();
      if (anonNotes.length) {
        try {
          for (const n of anonNotes) {
            await createNote({
              userId,
              contextType: n.contextType ?? n.context_type,
              contextId: n.contextId ?? n.context_id,
              body: n.body ?? "",
              posX: n.pos_x,
              posY: n.pos_y,
              zIndex: n.z_index,
              contextLabel: n.context_label ?? null,
              sourceEntryId: n.source_entry_id ?? null,
              sourceEntryTitle: n.source_entry_title ?? null,
            });
          }
          clearAnonWorking();
          migratedNotes = true;
        } catch {
          migratedFor.current = null;
        }
      }

      if (migratedManuscript) queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      if (migratedNotes) {
        queryClient.invalidateQueries({ queryKey: ["notes-library", userId] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      }
    })();
  }, [profile?.id, queryClient]);
}
