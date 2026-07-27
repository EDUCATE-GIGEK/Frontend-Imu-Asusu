import tw from "tailwind-styled-components";
import { formatYearRange } from "@/utils/entryFormat";

// A gallery card for one people group's (derived) timeline — same card idiom as
// ManuscriptCard: the whole card opens it, a corner marks saved groups. There is
// no timelines table; a "timeline" is just a group with visible entries.
const Card = tw.div`
  group bg-white rounded-md p-4 border cursor-pointer flex flex-col gap-1.5 outline-none
  ${(p) => (p.$saved ? "border-title" : "border-grey-info-outline")}
`;
const TopRow = tw.div`flex items-baseline justify-between gap-3`;
const CardTitle = tw.h3`font-heading text-base font-semibold text-title truncate`;
const Saved = tw.span`text-[11px] text-title opacity-45 shrink-0`;
const Meta = tw.div`flex items-center gap-2 text-xs text-title opacity-55`;
const Dot = tw.span`opacity-40`;
const CardSummary = tw.p`text-sm text-title opacity-70 leading-relaxed line-clamp-2`;
const NoSummary = tw.p`text-sm text-title opacity-35 italic`;
const Footer = tw.div`flex items-center justify-end mt-0.5`;
const OpenBtn = tw.button`
  text-xs font-medium text-title/50 rounded px-1.5 py-0.5 border-0 bg-transparent cursor-pointer
  group-hover:bg-orange-background-100 group-hover:text-title transition-colors
`;

export default function TimelineGroupCard({ group, onOpen }) {
  const range = group.range ? formatYearRange(group.range.min, group.range.max) : null;
  const summary = group.general_info?.summary ?? group.general_info?.description ?? null;

  return (
    <Card
      className="group"
      role="button"
      tabIndex={0}
      $saved={group.saved}
      onClick={() => onOpen(group)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(group);
        }
      }}
    >
      <TopRow>
        <CardTitle>{group.name}</CardTitle>
        {group.saved && <Saved>Saved</Saved>}
      </TopRow>

      <Meta>
        <span>{group.count} {group.count === 1 ? "entry" : "entries"}</span>
        {range && (
          <>
            <Dot>·</Dot>
            <span className="tabular-nums">{range}</span>
          </>
        )}
      </Meta>

      {summary ? <CardSummary>{summary}</CardSummary> : <NoSummary>No summary yet.</NoSummary>}

      <Footer>
        <OpenBtn type="button" onClick={(e) => { e.stopPropagation(); onOpen(group); }}>
          Open →
        </OpenBtn>
      </Footer>
    </Card>
  );
}
