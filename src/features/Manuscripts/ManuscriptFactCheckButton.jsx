import tw from "tailwind-styled-components";

// ── Styled components ────────────────────────────────────────────────────────
const Row = tw.div`flex items-center gap-3 flex-wrap`;
const CheckBtn = tw.button`
  inline-flex items-center gap-1.5 text-xs font-semibold text-title
  border border-grey-info-outline rounded-lg px-3 py-1.5
  hover:border-orange-300 transition-colors bg-transparent cursor-pointer disabled:opacity-50
`;
const Status = tw.p`text-xs text-title opacity-70`;
const WarnStatus = tw.p`text-xs text-title opacity-80`;
const ErrorStatus = tw.p`text-xs text-red-500`;

// Fact-check is deliberate, not automatic: one button runs the whole draft and
// the results surface as inline underlines the user clicks to review. This
// replaces the old standing panel — detail lives in the editor, not here.
export default function ManuscriptFactCheckButton({
  hasContent,
  hasContexts,
  isPending,
  error,
  items,
  hasRun,
  sourceCount,
  onRun,
}) {
  const noSources = hasRun && sourceCount === 0;
  const nothingFound = hasRun && sourceCount > 0 && items.length === 0;
  const flagged = items.length;

  return (
    <Row>
      <CheckBtn
        type="button"
        disabled={!hasContent || !hasContexts || isPending}
        onClick={onRun}
      >
        {isPending ? "Checking…" : "Check facts"}
      </CheckBtn>

      {!hasContexts ? (
        <Status>Select a context to fact-check against our records.</Status>
      ) : error ? (
        <ErrorStatus>{error.message}</ErrorStatus>
      ) : noSources ? (
        <WarnStatus>
          We hold no records for the selected context, so nothing could be checked — a gap in the
          repository, not a clean bill of health.
        </WarnStatus>
      ) : nothingFound ? (
        <Status>No checkable claims found in this draft.</Status>
      ) : flagged > 0 ? (
        <Status>
          {flagged} claim{flagged === 1 ? "" : "s"} underlined in your text — click any to review.
        </Status>
      ) : null}
    </Row>
  );
}
