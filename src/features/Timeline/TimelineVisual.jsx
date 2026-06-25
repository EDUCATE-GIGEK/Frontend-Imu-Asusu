import tw from "tailwind-styled-components";

const INFLUENCE_STYLES = {
  "Trade":              "bg-amber-100 text-amber-800",
  "Colonial / Religious": "bg-red-100 text-red-800",
  "Political":          "bg-blue-100 text-blue-800",
  "Military / Political": "bg-slate-200 text-slate-800",
  "Religious":          "bg-purple-100 text-purple-800",
  "Natural":            "bg-green-100 text-green-800",
};

const Wrapper = tw.div``;
const BackBtn = tw.button`text-sm text-title opacity-50 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer mb-6 flex items-center gap-1`;
const Header = tw.div`mb-8`;
const AspectBadge = tw.span`text-xs font-semibold bg-orange-background-100 text-title rounded-full px-3 py-1`;
const VisualTitle = tw.h2`font-heading text-2xl font-bold text-title mt-3 mb-1`;
const VisualMeta = tw.p`text-xs text-title opacity-50 mb-3`;
const VisualDescription = tw.p`text-sm text-title opacity-60 leading-relaxed`;

const TimelineTrack = tw.div`relative ml-4`;
const TrackLine = tw.div`absolute left-0 top-0 bottom-0 w-0.5 bg-grey-info-outline`;

const Entry = tw.div`relative pl-8 pb-10 last:pb-0`;
const EntryDot = tw.div`absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-title bg-white -translate-x-[5px]`;
const EntryYear = tw.p`text-xs font-bold text-title opacity-40 mb-0.5 uppercase tracking-widest`;
const EntryCard = tw.div`bg-white border border-grey-info-outline rounded-xl p-4`;
const EraBadge = tw.span`text-xs text-title opacity-50 font-medium`;
const EntryTitle = tw.h4`font-heading text-base font-semibold text-title mt-0.5 mb-2`;
const EntryDescription = tw.p`text-sm text-title opacity-70 leading-relaxed`;
const InfluenceRow = tw.div`flex flex-wrap gap-1.5 mt-3`;
const GroupBadge = tw.span`text-xs font-medium rounded-full px-2.5 py-0.5`;
const InfluenceLabel = tw.span`text-xs text-title opacity-40 mt-3 block`;

export default function TimelineVisual({ timeline, onBack }) {
  return (
    <Wrapper>
      <BackBtn type="button" onClick={onBack}>← All timelines</BackBtn>

      <Header>
        <AspectBadge>{timeline.aspect}</AspectBadge>
        <VisualTitle>{timeline.title}</VisualTitle>
        <VisualMeta>
          {timeline.people_group} · {timeline.location} · {timeline.date_range.start}–{timeline.date_range.end}
        </VisualMeta>
        <VisualDescription>{timeline.description}</VisualDescription>
      </Header>

      <TimelineTrack>
        <TrackLine />
        {timeline.entries.map((entry) => {
          const influenceStyle = INFLUENCE_STYLES[entry.influence_type] ?? "bg-grey-info-outline text-title";
          return (
            <Entry key={entry.id}>
              <EntryDot />
              <EntryYear>{entry.year}</EntryYear>
              <EntryCard>
                <EraBadge>{entry.era}</EraBadge>
                <EntryTitle>{entry.title}</EntryTitle>
                <EntryDescription>{entry.description}</EntryDescription>

                {entry.influencing_groups?.length > 0 && (
                  <>
                    <InfluenceLabel>External influence</InfluenceLabel>
                    <InfluenceRow>
                      {entry.influencing_groups.map((g) => (
                        <GroupBadge key={g} className={influenceStyle}>{g}</GroupBadge>
                      ))}
                      <GroupBadge className={influenceStyle}>{entry.influence_type}</GroupBadge>
                    </InfluenceRow>
                  </>
                )}
              </EntryCard>
            </Entry>
          );
        })}
      </TimelineTrack>
    </Wrapper>
  );
}
