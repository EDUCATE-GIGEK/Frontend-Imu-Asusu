import { GoEye } from "react-icons/go";
import tw from "tailwind-styled-components";
import { educationLabel } from "@/features/Manuscripts/educationLevels";

// A public manuscript as it appears on Collaborate. Same compact, outlined card
// as the private library so the two lists read as one system — what's added is
// the attribution line and the community signals (upvote, fork, views).
const Card = tw.div`
  group bg-white rounded-md p-4 border border-grey-info-outline cursor-pointer
  flex flex-col gap-1.5 outline-none hover:border-orange-300 transition-colors
`;
const TopRow = tw.div`flex items-baseline justify-between gap-3`;
const CardTitle = tw.h3`font-heading text-base font-semibold text-title truncate`;
const CardDate = tw.span`text-xs text-title opacity-40 shrink-0`;
const Byline = tw.p`text-xs text-title opacity-50`;
const CardSummary = tw.p`text-sm text-title opacity-70 leading-relaxed line-clamp-2 whitespace-pre-line`;
const NoSummary = tw.p`text-sm text-title opacity-35 italic`;
const MatchNote = tw.p`text-xs text-title opacity-55`;
const Footer = tw.div`flex items-center justify-between gap-3 mt-1`;
const Signals = tw.div`flex items-center gap-3 text-xs text-title opacity-45 shrink-0`;
const Signal = tw.span`inline-flex items-center gap-1`;
const Actions = tw.div`flex items-center gap-2 shrink-0`;
const UpvoteBtn = tw.button`
  inline-flex items-center gap-1 text-xs font-medium rounded px-1.5 py-0.5 cursor-pointer
  border border-grey-info-outline bg-white text-title/60
  hover:border-orange-300 hover:text-title transition-colors disabled:opacity-40
  data-[on=true]:border-orange-300 data-[on=true]:bg-orange-background-100 data-[on=true]:text-title
`;
const ForkBtn = tw.button`
  text-xs font-medium text-title/60 rounded px-1.5 py-0.5 cursor-pointer
  border border-grey-info-outline bg-white
  hover:border-orange-300 hover:text-title transition-colors disabled:opacity-40
`;
const OpenBtn = tw.button`
  text-xs font-medium text-title/50 rounded px-1.5 py-0.5 border-0 bg-transparent cursor-pointer
  group-hover:bg-orange-background-100 group-hover:text-title transition-colors
`;

export default function CollaborateCard({
  manuscript,
  isUpvoted,
  onUpvote,
  onFork,
  onOpen,
  isForking,
  isUpvoting,
  canAct = true,
}) {
  const date = new Date(manuscript.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const level = educationLabel(manuscript.education_level);
  const byline = [manuscript.author?.name || "Unknown author", level].filter(Boolean).join(" · ");

  function stop(e, fn) {
    e.stopPropagation();
    fn();
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(manuscript)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(manuscript); }
      }}
    >
      <TopRow>
        <CardTitle>{manuscript.title || "Untitled"}</CardTitle>
        <CardDate>{date}</CardDate>
      </TopRow>

      <Byline>{byline}</Byline>

      {manuscript.summary ? (
        <CardSummary>{manuscript.summary}</CardSummary>
      ) : (
        <NoSummary>No summary provided.</NoSummary>
      )}

      {manuscript.matches > 0 && (
        <MatchNote>
          Covers {manuscript.matches} of your region{manuscript.matches === 1 ? "" : "s"}
        </MatchNote>
      )}

      <Footer>
        <Signals>
          <Signal title="Forks">⑂ {manuscript.fork_count ?? 0}</Signal>
          <Signal title="Readers">
            <GoEye size={13} aria-hidden />
            {manuscript.view_count ?? 0}
          </Signal>
        </Signals>

        <Actions>
          <UpvoteBtn
            type="button"
            data-on={!!isUpvoted}
            disabled={!canAct || isUpvoting}
            title={canAct ? (isUpvoted ? "Remove upvote" : "Upvote") : "Log in to upvote"}
            onClick={(e) => stop(e, () => onUpvote(manuscript))}
          >
            ▲ {manuscript.upvote_count ?? 0}
          </UpvoteBtn>
          <ForkBtn
            type="button"
            disabled={!canAct || isForking}
            title={canAct ? "Copy into your library" : "Log in to fork"}
            onClick={(e) => stop(e, () => onFork(manuscript))}
          >
            {isForking ? "Forking…" : "Fork"}
          </ForkBtn>
          <OpenBtn type="button" onClick={(e) => stop(e, () => onOpen(manuscript))}>Read →</OpenBtn>
        </Actions>
      </Footer>
    </Card>
  );
}
