import tw from "tailwind-styled-components";

const Card = tw.div`
  bg-white border border-grey-info-outline rounded-xl p-5
  cursor-pointer hover:border-orange-300 hover:shadow-sm
  transition-all duration-200 flex flex-col gap-3
`;
const AspectBadge = tw.span`text-xs font-semibold bg-orange-background-100 text-title rounded-full px-3 py-1 self-start`;
const CardTitle = tw.h3`font-heading text-xl font-semibold text-title leading-snug`;
const CardMeta = tw.p`text-xs text-title opacity-50`;
const CardDescription = tw.p`text-sm text-title opacity-70 leading-relaxed line-clamp-2`;
const Footer = tw.div`flex items-center justify-between mt-1`;
const EntryCount = tw.span`text-xs text-title opacity-40`;
const ReadMore = tw.span`text-xs font-semibold text-title opacity-50 group-hover:opacity-100 transition-opacity`;

export default function TimelineCard({ timeline, onClick }) {
  const { start, end } = timeline.date_range;
  return (
    <Card className="group" onClick={() => onClick(timeline)}>
      <AspectBadge>{timeline.aspect}</AspectBadge>
      <div>
        <CardTitle>{timeline.title}</CardTitle>
        <CardMeta>{timeline.people_group} · {timeline.location} · {start}–{end}</CardMeta>
      </div>
      <CardDescription>{timeline.description}</CardDescription>
      <Footer>
        <EntryCount>{timeline.entries.length} events</EntryCount>
        <ReadMore>View timeline →</ReadMore>
      </Footer>
    </Card>
  );
}
