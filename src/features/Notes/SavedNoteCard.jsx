import { useState } from "react";
import tw from "tailwind-styled-components";

// A saved note in the library. Read-only here: to change the text you go back to
// the context it was created in (the Edit link — wired in phase 5). This card only
// downloads or deletes.
const Card = tw.div`
  bg-white rounded-md p-4 border border-grey-info-outline flex flex-col gap-2
`;
const TopRow = tw.div`flex items-baseline justify-between gap-2`;
const Context = tw.span`
  text-[10px] uppercase tracking-wide text-title bg-orange-300/25 rounded px-1.5 py-0.5 truncate
`;
const CardDate = tw.span`text-xs text-title opacity-40 shrink-0`;
const From = tw.p`text-xs font-medium text-title opacity-70 truncate`;
const Body = tw.p`text-sm text-title opacity-80 leading-relaxed whitespace-pre-line line-clamp-5`;
const NoBody = tw.p`text-sm text-title opacity-35 italic`;
const Actions = tw.div`flex items-center gap-3 mt-1`;
const Spacer = tw.div`flex-1`;
const Action = tw.button`text-xs font-medium text-title opacity-55 hover:opacity-100 bg-transparent border-0 cursor-pointer p-0`;
const DeleteAction = tw.button`text-xs font-medium text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50`;
const ConfirmAction = tw.button`text-xs font-semibold text-red-600 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50`;
const CancelAction = tw.button`text-xs text-title opacity-50 hover:opacity-100 bg-transparent border-0 cursor-pointer p-0`;

export default function SavedNoteCard({ note, canEdit, onEdit, onDelete, deleting }) {
  const [confirming, setConfirming] = useState(false);

  const date = new Date(note.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  // Everything about the note lives on the card: the context it was taken in, the
  // entry it came from, when, and its text.
  const context =
    note.context_label ?? (note.context_type === "timeline" ? "Timeline" : note.context_type);
  const from = note.source_entry_title ?? "General note";

  return (
    <Card>
      <TopRow>
        <Context title={context}>{context}</Context>
        <CardDate>{date}</CardDate>
      </TopRow>

      <From title={from}>{from}</From>

      {note.body?.trim() ? <Body>{note.body}</Body> : <NoBody>Empty note.</NoBody>}

      <Actions>
        {canEdit && (
          <Action type="button" onClick={() => onEdit(note)}>
            Edit →
          </Action>
        )}
        <Spacer />
        {confirming ? (
          <>
            <CancelAction type="button" onClick={() => setConfirming(false)}>
              Cancel
            </CancelAction>
            <ConfirmAction
              type="button"
              disabled={deleting}
              onClick={() => {
                onDelete(note.id);
                setConfirming(false);
              }}
            >
              {deleting ? "Deleting…" : "Delete?"}
            </ConfirmAction>
          </>
        ) : (
          <DeleteAction type="button" disabled={deleting} onClick={() => setConfirming(true)}>
            Delete
          </DeleteAction>
        )}
      </Actions>
    </Card>
  );
}
