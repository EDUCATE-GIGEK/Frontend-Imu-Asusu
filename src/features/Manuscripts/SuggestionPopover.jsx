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
`;
const Old = tw.p`text-sm text-title line-through opacity-50`;
const New = tw.p`text-sm font-medium text-title`;
const Issue = tw.p`text-xs text-title opacity-70`;
const Actions = tw.div`flex gap-2 mt-1`;
const ApplyBtn = tw.button`
  flex-1 text-xs font-semibold text-white bg-title rounded-md px-3 py-1.5
  border-0 cursor-pointer hover:opacity-90 transition-opacity
`;
const DismissBtn = tw.button`
  text-xs font-semibold text-title border border-grey-info-outline rounded-md px-3 py-1.5
  bg-transparent cursor-pointer hover:border-orange-300 transition-colors
`;

export default function SuggestionPopover({ item, top, left, onApply, onDismiss }) {
  return (
    <Card style={{ top, left }} role="dialog" onMouseDown={(e) => e.stopPropagation()}>
      <TagRow>
        <Tag data-cat={item.category}>{item.category === "tone" ? "Tone" : "Grammar"}</Tag>
      </TagRow>
      <Old>{item.excerpt}</Old>
      <New>
        {"→ "}
        {item.replacement ? item.replacement : <em className="opacity-60">(remove)</em>}
      </New>
      {item.issue && <Issue>{item.issue}</Issue>}
      <Actions>
        <ApplyBtn type="button" onClick={onApply}>Apply</ApplyBtn>
        <DismissBtn type="button" onClick={onDismiss}>Dismiss</DismissBtn>
      </Actions>
    </Card>
  );
}
