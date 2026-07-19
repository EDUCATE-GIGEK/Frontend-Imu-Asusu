import tw from "tailwind-styled-components";

const Card = tw.div`
  absolute z-20 w-72 max-w-[90vw] flex flex-col gap-2
  bg-white border border-grey-info-outline rounded-lg shadow-lg p-3
`;
const TagRow = tw.div`flex items-center justify-between`;
const Tag = tw.span`
  text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5
  data-[cat=tone]:bg-orange-background-100 data-[cat=tone]:text-orange-accent
  data-[cat=grammar]:bg-red-50 data-[cat=grammar]:text-red-500
  data-[cat=fact-supported]:bg-green-50 data-[cat=fact-supported]:text-green-700
  data-[cat=fact-contradicted]:bg-red-50 data-[cat=fact-contradicted]:text-red-500
  data-[cat=fact-no-evidence]:bg-grey-info-outline/30 data-[cat=fact-no-evidence]:text-title
`;
const Old = tw.p`text-sm text-title line-through opacity-50`;
const Quote = tw.p`text-sm text-title italic opacity-70`;
const New = tw.p`text-sm font-medium text-title`;
const Issue = tw.p`text-xs text-title opacity-70`;
const SourceRow = tw.p`text-[11px] text-title opacity-60`;
const Actions = tw.div`flex gap-2 mt-1`;
const ApplyBtn = tw.button`
  flex-1 text-xs font-semibold text-white bg-title rounded-md px-3 py-1.5
  border-0 cursor-pointer hover:opacity-90 transition-opacity
`;
const DismissBtn = tw.button`
  flex-1 text-xs font-semibold text-title border border-grey-info-outline rounded-md px-3 py-1.5
  bg-transparent cursor-pointer hover:border-orange-300 transition-colors
`;

const TAG_LABEL = {
  tone: "Tone",
  grammar: "Grammar",
  "fact-supported": "Supported by records",
  "fact-contradicted": "Contradicted",
  "fact-no-evidence": "Not in our records",
};

export default function ManuscriptSuggestionPopover({ item, top, left, onApply, onDismiss }) {
  const isFact = item.category?.startsWith("fact");
  // Tone/grammar always rewrite. A fact-check only offers a rewrite when a
  // record contradicts the claim — "supported" and "no record" are read-only.
  const canApply = Boolean(item.replacement);

  return (
    <Card style={{ top, left }} role="dialog" onMouseDown={(e) => e.stopPropagation()}>
      <TagRow>
        <Tag data-cat={item.category}>{TAG_LABEL[item.category] ?? item.category}</Tag>
      </TagRow>

      {canApply ? <Old>{item.excerpt}</Old> : <Quote>{item.excerpt}</Quote>}

      {canApply && <New>→ {item.replacement}</New>}
      {!isFact && !canApply && (
        <New>
          → <em className="opacity-60">(remove)</em>
        </New>
      )}

      {item.issue && <Issue>{item.issue}</Issue>}

      {isFact && item.sources?.length > 0 && (
        <SourceRow>Source: {item.sources.map((s) => s.label).join(", ")}</SourceRow>
      )}

      <Actions>
        {canApply && (
          <ApplyBtn type="button" onClick={onApply}>
            {isFact ? "Apply correction" : "Apply"}
          </ApplyBtn>
        )}
        <DismissBtn type="button" onClick={onDismiss}>Dismiss</DismissBtn>
      </Actions>
    </Card>
  );
}
