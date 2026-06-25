import { useState } from "react";
import tw from "tailwind-styled-components";
import TimelineCard from "@/features/Timeline/TimelineCard";
import TimelineVisual from "@/features/Timeline/TimelineVisual";
import timelinesData from "@/data/timeline_template.json";

const PageWrapper = tw.div``;
const PageTitle = tw.h1`text-3xl font-bold text-title mb-2`;
const Subtitle = tw.p`text-sm text-title opacity-60 leading-relaxed mb-8`;
const CardGrid = tw.div`grid grid-cols-3 gap-4`;

export default function Timeline() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <PageWrapper>
        <TimelineVisual timeline={selected} onBack={() => setSelected(null)} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>Timelines</PageTitle>
      <Subtitle>
        Each timeline traces how a particular aspect of an endangered group's culture has been
        shaped by contact with external peoples over time.
      </Subtitle>
      <CardGrid>
        {timelinesData.map((timeline) => (
          <TimelineCard key={timeline.id} timeline={timeline} onClick={setSelected} />
        ))}
      </CardGrid>
    </PageWrapper>
  );
}
