import { useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { GoEye } from "react-icons/go";
import tw from "tailwind-styled-components";
import { educationLabel } from "@/features/Manuscripts/educationLevels";
import styles from "./CollaborateReader.module.css";

// Reading someone else's manuscript. Deliberately read-only: the way to change
// a shared manuscript is to fork it, so the only action here is Fork.
const Backdrop = tw.div`fixed inset-0 z-40 bg-black/30`;
const Panel = tw.aside`
  fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col
  border-l border-grey-info-outline bg-white
`;
const PanelHeader = tw.div`flex items-start justify-between gap-3 border-b border-grey-info-outline px-6 py-4`;
const HeaderText = tw.div`min-w-0`;
const PanelTitle = tw.p`font-heading text-lg font-semibold text-title truncate`;
const Byline = tw.p`text-xs text-title opacity-50 mt-0.5`;
const CloseBtn = tw.button`text-title opacity-40 hover:opacity-100 bg-transparent border-0 cursor-pointer text-xl leading-none shrink-0`;
const PanelBody = tw.div`flex-1 overflow-y-auto px-6 py-5`;
const Summary = tw.p`text-sm text-title opacity-70 leading-relaxed border-l-2 border-grey-info-outline pl-3 mb-5`;
const Empty = tw.p`text-sm text-title opacity-40 italic`;
const PanelFooter = tw.div`flex items-center justify-between gap-3 border-t border-grey-info-outline px-6 py-4`;
const Signals = tw.div`flex items-center gap-4 text-xs text-title opacity-50`;
const ForkBtn = tw.button`
  bg-title text-white rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer border-0
  disabled:opacity-50
`;

export default function CollaborateReader({ manuscript, onClose, onFork, isForking, canFork = true }) {
  // This is another user's HTML, so it is sanitised before it ever reaches the
  // DOM — the editor produces safe markup, but nothing stops a crafted write
  // straight to the API.
  const safeBody = useMemo(
    () => DOMPurify.sanitize(manuscript?.manuscript_description ?? ""),
    [manuscript?.manuscript_description],
  );

  useEffect(() => {
    if (!manuscript) return undefined;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [manuscript, onClose]);

  if (!manuscript) return null;

  const level = educationLabel(manuscript.education_level);
  const date = new Date(manuscript.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const byline = [manuscript.author?.name || "Unknown author", level, date]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Backdrop onClick={onClose} />
      <Panel role="dialog" aria-label={`Reading ${manuscript.title || "manuscript"}`}>
        <PanelHeader>
          <HeaderText>
            <PanelTitle>{manuscript.title || "Untitled"}</PanelTitle>
            <Byline>{byline}</Byline>
          </HeaderText>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">×</CloseBtn>
        </PanelHeader>

        <PanelBody>
          {manuscript.summary && <Summary>{manuscript.summary}</Summary>}
          {safeBody ? (
            <div className={styles.body} dangerouslySetInnerHTML={{ __html: safeBody }} />
          ) : (
            <Empty>This manuscript has no written content yet.</Empty>
          )}
        </PanelBody>

        <PanelFooter>
          <Signals>
            <span title="Upvotes">▲ {manuscript.upvote_count ?? 0}</span>
            <span title="Forks">⑂ {manuscript.fork_count ?? 0}</span>
            <span className="inline-flex items-center gap-1" title="Readers">
              <GoEye size={13} aria-hidden />
              {manuscript.view_count ?? 0}
            </span>
          </Signals>
          <ForkBtn
            type="button"
            disabled={!canFork || isForking}
            onClick={() => onFork(manuscript)}
          >
            {isForking ? "Forking…" : "Fork into my library"}
          </ForkBtn>
        </PanelFooter>
      </Panel>
    </>
  );
}
