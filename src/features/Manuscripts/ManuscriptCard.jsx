import { useState } from "react";
import tw from "tailwind-styled-components";
import { getManuscriptFileUrl } from "@/services/storage/getManuscriptFileUrl";

// Compact, timeline-style card: the whole card opens the manuscript; the file
// and delete controls stop propagation so they don't also trigger it.
const Card = tw.div`
  group bg-white rounded-md p-4 border border-grey-info-outline cursor-pointer flex flex-col gap-1.5
  outline-none
`;
const TopRow = tw.div`flex items-baseline justify-between gap-3`;
const CardTitle = tw.h3`font-heading text-base font-semibold text-title truncate`;
const CardDate = tw.span`text-xs text-title opacity-40 shrink-0`;
const CardSummary = tw.p`text-sm text-title opacity-70 leading-relaxed line-clamp-2 whitespace-pre-line`;
const NoSummary = tw.p`text-sm text-title opacity-35 italic`;
const Footer = tw.div`flex items-center justify-between gap-3 mt-0.5`;
const FileBtn = tw.button`text-xs font-medium text-title opacity-55 hover:opacity-100 bg-transparent border-0 cursor-pointer p-0 truncate max-w-[16rem] disabled:opacity-40`;
const Actions = tw.div`flex items-center gap-3 shrink-0`;
const DeleteLink = tw.button`text-xs font-medium text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50`;
const ConfirmLink = tw.button`text-xs font-semibold text-red-600 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50`;
const CancelLink = tw.button`text-xs text-title opacity-50 hover:opacity-100 bg-transparent border-0 cursor-pointer p-0`;
const OpenBtn = tw.button`
  text-xs font-medium text-title/50 rounded px-1.5 py-0.5 border-0 bg-transparent cursor-pointer
  group-hover:bg-orange-background-100 group-hover:text-title transition-colors
`;

export default function ManuscriptCard({ manuscript, onEdit, onDelete, isDeleting }) {
  const [confirming, setConfirming] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(e) {
    e.stopPropagation();
    if (!manuscript.file_path) return;
    setDownloading(true);
    try {
      const url = await getManuscriptFileUrl(manuscript.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // silently fail — url generation failed
    } finally {
      setDownloading(false);
    }
  }

  const date = new Date(manuscript.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Card
      className="group"
      role="button"
      tabIndex={0}
      onClick={() => onEdit(manuscript)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(manuscript); }
      }}
    >
      <TopRow>
        <CardTitle>{manuscript.title || "Untitled"}</CardTitle>
        <CardDate>{date}</CardDate>
      </TopRow>

      {manuscript.summary ? (
        <CardSummary>{manuscript.summary}</CardSummary>
      ) : (
        <NoSummary>No summary provided.</NoSummary>
      )}

      <Footer>
        {manuscript.file_path ? (
          <FileBtn type="button" onClick={handleDownload} disabled={downloading} title={manuscript.file_name ?? "Attached file"}>
            📎 {downloading ? "Opening…" : (manuscript.file_name ?? "Open file")}
          </FileBtn>
        ) : (
          <span />
        )}

        <Actions>
          {confirming ? (
            <>
              <CancelLink type="button" onClick={(e) => { e.stopPropagation(); setConfirming(false); }}>Cancel</CancelLink>
              <ConfirmLink type="button" disabled={isDeleting} onClick={(e) => { e.stopPropagation(); onDelete(manuscript.id); setConfirming(false); }}>
                {isDeleting ? "Deleting…" : "Delete?"}
              </ConfirmLink>
            </>
          ) : (
            <>
              <DeleteLink type="button" disabled={isDeleting} onClick={(e) => { e.stopPropagation(); setConfirming(true); }}>Delete</DeleteLink>
              <OpenBtn type="button" onClick={(e) => { e.stopPropagation(); onEdit(manuscript); }}>Open →</OpenBtn>
            </>
          )}
        </Actions>
      </Footer>
    </Card>
  );
}
