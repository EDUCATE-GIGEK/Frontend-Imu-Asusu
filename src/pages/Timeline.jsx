import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import tw from "tailwind-styled-components";
import { getTimelineForPeople } from "@/services/apiTimeline";
import { getAllPeoples } from "@/services/apiPeoples";
import { getEntryCountsByPeople } from "@/services/apiEntries";
import usePreferences from "@/hooks/usePreferences";
import TimelineGraph from "@/features/Timeline/TimelineGraph";
import EntryDrawer from "@/features/Timeline/EntryDrawer";
import { RELATION_STYLE, CONTRADICTS_COLOR } from "@/features/Timeline/timelineLayout";
import Spinner from "@/ui/Spinner";

const PageTitle = tw.h1`text-3xl font-bold text-title mb-2`;
const Subtitle = tw.p`text-sm text-title opacity-60 leading-relaxed mb-5 max-w-2xl`;

const GroupBar = tw.div`flex flex-wrap items-center gap-2 mb-5`;
const GroupTab = tw.button`
  text-sm rounded-full px-3.5 py-1.5 border cursor-pointer transition-colors font-body
  ${(p) =>
    p.$on
      ? "border-title text-title bg-orange-background-100"
      : "border-grey-info-outline text-title opacity-60 bg-transparent hover:opacity-100"}
`;
const Count = tw.span`ml-1.5 text-[11px] opacity-60 tabular-nums`;

const Legend = tw.div`flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4`;
const LegendItem = tw.span`flex items-center gap-1.5 text-[11px] text-title opacity-60`;

const Note = tw.p`text-xs text-title opacity-50 mb-4`;
const Empty = tw.p`text-sm text-title opacity-60 py-10`;

// The relation types worth explaining up front. The rest read fine from the
// drawer once an entry is open.
const LEGEND = ["caused", "followed_by", "derived_from", "contradicts"];

export default function Timeline() {
  const { prefs } = usePreferences();
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null);

  const { data: peoples = [], isLoading: loadingPeoples } = useQuery({
    queryKey: ["all-peoples"],
    queryFn: getAllPeoples,
  });
  const { data: counts = new Map(), isLoading: loadingCounts } = useQuery({
    queryKey: ["entry-counts-by-people"],
    queryFn: getEntryCountsByPeople,
  });

  // Groups the user actually saved come first; any other group with readable
  // entries stays reachable, so a fresh visitor is never shown an empty page.
  const groups = useMemo(() => {
    const savedIds = new Set(
      (prefs.regions ?? []).filter((r) => r.kind === "people").map((r) => r.id),
    );
    return peoples
      .map((p) => ({ ...p, count: counts.get(p.id) ?? 0, saved: savedIds.has(p.id) }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.saved - a.saved || b.count - a.count || a.name.localeCompare(b.name));
  }, [peoples, counts, prefs.regions]);

  const activeGroup = groups.find((g) => g.id === activeId) ?? groups[0] ?? null;

  const { data: timeline, isLoading: loadingTimeline } = useQuery({
    queryKey: ["timeline", activeGroup?.id],
    queryFn: () => getTimelineForPeople(activeGroup.id),
    enabled: Boolean(activeGroup),
  });

  const entriesById = useMemo(
    () => new Map((timeline?.entries ?? []).map((e) => [e.id, e])),
    [timeline],
  );

  if (loadingPeoples || loadingCounts) return <Spinner />;

  if (groups.length === 0) {
    return (
      <div>
        <PageTitle>Timeline</PageTitle>
        <Empty>
          No published entries yet. Entries appear here once their workflow status
          is set to published.
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Timeline</PageTitle>
      <Subtitle>
        The same entries you can browse in Explore, arranged by time and joined by
        the relationships between them — what caused what, what followed what, and
        where accounts contradict each other.
      </Subtitle>

      <GroupBar>
        {groups.map((g) => (
          <GroupTab
            key={g.id}
            type="button"
            $on={g.id === activeGroup?.id}
            onClick={() => {
              setActiveId(g.id);
              setSelected(null);
            }}
          >
            {g.name}
            <Count>{g.count}</Count>
          </GroupTab>
        ))}
      </GroupBar>

      <Legend>
        {LEGEND.map((kind) => {
          const style = RELATION_STYLE[kind];
          return (
            <LegendItem key={kind}>
              <svg width="26" height="8" aria-hidden="true">
                <line
                  x1="0"
                  y1="4"
                  x2="26"
                  y2="4"
                  stroke={kind === "contradicts" ? CONTRADICTS_COLOR : "#0f172a"}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash ?? undefined}
                  opacity={kind === "contradicts" ? 0.8 : 0.45}
                />
              </svg>
              {style.label}
            </LegendItem>
          );
        })}
      </Legend>

      {loadingTimeline || !timeline ? (
        <Spinner />
      ) : (
        <>
          {timeline.undatedCount > 0 && (
            <Note>
              {timeline.datedCount} of {timeline.entries.length} entries carry a
              date. The rest are ordered by their relationships — oral tradition
              often gives no year, and inventing one would misrepresent the source.
            </Note>
          )}
          <TimelineGraph
            timeline={timeline}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        </>
      )}

      <EntryDrawer
        entry={selected}
        relationships={timeline?.relationships ?? []}
        entriesById={entriesById}
        onSelect={setSelected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
