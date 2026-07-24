import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import { getNotesByUser, deleteNote } from "@/services/apiNotes";
import SavedNoteCard from "@/features/Notes/SavedNoteCard";
import Spinner from "@/ui/Spinner";

const PageTitle = tw.h1`text-3xl font-bold text-title mb-2`;
const Subtitle = tw.p`text-sm text-title opacity-60 leading-relaxed mb-5 max-w-2xl`;
const Grid = tw.div`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3`;
const Empty = tw.p`text-sm text-title opacity-60 py-10`;

export default function Notes() {
  const { profile, isLoading: authLoading } = useAuth();
  const userId = profile?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Editing happens in the note's original context, not here: open that surface and
  // deep-link the note so it comes up focused. Only timeline has a surface today.
  function editNote(note) {
    if (note.context_type !== "timeline") return;
    navigate(
      `/app/my-timeline?group=${encodeURIComponent(note.context_id)}&note=${encodeURIComponent(note.id)}`,
    );
  }

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes-library", userId],
    queryFn: () => getNotesByUser(userId),
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes-library", userId] }),
  });

  if (authLoading || (userId && isLoading)) return <Spinner />;

  return (
    <div>
      <PageTitle>Notes</PageTitle>
      <Subtitle>
        Notes you&apos;ve saved while studying, grouped by where you took them. To
        edit one, open it from its original context; here you can download or delete.
      </Subtitle>

      {!userId ? (
        <Empty>Log in to see your saved notes.</Empty>
      ) : notes.length === 0 ? (
        <Empty>
          No saved notes yet. Open a timeline, add a note, and hit Save to keep it
          here.
        </Empty>
      ) : (
        <Grid>
          {notes.map((note) => (
            <SavedNoteCard
              key={note.id}
              note={note}
              canEdit={note.context_type === "timeline"}
              onEdit={editNote}
              onDelete={(id) => deleteMutation.mutate(id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === note.id}
            />
          ))}
        </Grid>
      )}
    </div>
  );
}
