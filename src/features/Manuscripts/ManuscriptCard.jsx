import { useState } from "react";
import tw from "tailwind-styled-components";
import { getManuscriptFileUrl } from "@/services/storage/getManuscriptFileUrl";

const Card = tw.div`bg-white border border-grey-info-outline rounded-xl p-5 flex flex-col gap-3`;
const CardTitle = tw.h3`font-heading text-lg font-semibold text-title`;
const CardDate = tw.p`text-xs text-title opacity-40 mt-0.5`;
const CardDescription = tw.p`text-sm text-title opacity-70 leading-relaxed line-clamp-3`;
const TagRow = tw.div`flex flex-wrap gap-1.5`;
const Tag = tw.span`text-xs bg-orange-background-100 text-title rounded-full px-2.5 py-0.5`;
const FileRow = tw.div`flex items-center gap-2`;
const FileLabel = tw.span`text-xs text-title opacity-50 truncate max-w-[16rem]`;
const DownloadBtn = tw.button`text-xs font-semibold text-title border border-grey-info-outline rounded-lg px-3 py-1.5 hover:border-orange-300 transition-colors bg-transparent cursor-pointer disabled:opacity-50`;
const ActionRow = tw.div`flex gap-2 mt-1`;
const EditBtn = tw.button`text-xs font-semibold text-title border border-grey-info-outline rounded-lg px-3 py-1.5 hover:border-orange-300 transition-colors bg-transparent cursor-pointer`;
const DeleteBtn = tw.button`text-xs font-semibold text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors bg-transparent disabled:opacity-50 cursor-pointer`;
const ConfirmBtn = tw.button`text-xs font-semibold text-white bg-red-500 rounded-lg px-3 py-1.5 hover:bg-red-600 transition-colors border-0 disabled:opacity-50 cursor-pointer`;
const CancelBtn = tw.button`text-xs text-title border border-grey-info-outline rounded-lg px-3 py-1.5 bg-transparent cursor-pointer`;

function buildTags(contexts) {
  if (!contexts) return [];
  const tags = [];
  const add = (arr, singular, plural) => { if (arr?.length) tags.push(`${arr.length} ${arr.length === 1 ? singular : plural}`); };
  add(contexts.states, "State", "States");
  add(contexts.localGovernments, "LG", "LGs");
  add(contexts.ethnicGroups, "Ethnic Group", "Ethnic Groups");
  add(contexts.tribes, "Tribe", "Tribes");
  return tags;
}

export default function ManuscriptCard({ manuscript, onEdit, onDelete, isDeleting }) {
  const [confirming, setConfirming] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
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
  const tags = buildTags(manuscript.contexts);
  const date = new Date(manuscript.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Card>
      <div>
        <CardTitle>{manuscript.title}</CardTitle>
        <CardDate>{date}</CardDate>
      </div>

      {tags.length > 0 && (
        <TagRow>
          {tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </TagRow>
      )}

      {manuscript.manuscript_description && (
        <CardDescription>{manuscript.manuscript_description}</CardDescription>
      )}

      {manuscript.file_path && (
        <FileRow>
          <FileLabel>{manuscript.file_name ?? "Attached file"}</FileLabel>
          <DownloadBtn type="button" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Opening…" : "Open"}
          </DownloadBtn>
        </FileRow>
      )}

      <ActionRow>
        <EditBtn type="button" onClick={() => onEdit(manuscript)} disabled={isDeleting}>
          Edit
        </EditBtn>

        {confirming ? (
          <>
            <ConfirmBtn
              type="button"
              disabled={isDeleting}
              onClick={() => { onDelete(manuscript.id); setConfirming(false); }}
            >
              {isDeleting ? "Deleting…" : "Yes, delete"}
            </ConfirmBtn>
            <CancelBtn type="button" onClick={() => setConfirming(false)}>Cancel</CancelBtn>
          </>
        ) : (
          <DeleteBtn type="button" onClick={() => setConfirming(true)} disabled={isDeleting}>
            Delete
          </DeleteBtn>
        )}
      </ActionRow>
    </Card>
  );
}
