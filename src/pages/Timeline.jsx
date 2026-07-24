import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import tw from "tailwind-styled-components";
import { getTimelineForPeople } from "@/services/apiTimeline";
import { getAllPeoples } from "@/services/apiPeoples";
import { getEntryCountsByPeople, getPeriodRangesByPeople } from "@/services/apiEntries";
import usePreferences from "@/hooks/usePreferences";
import TimelineGraph from "@/features/Timeline/TimelineGraph";
import TimelineGroupCard from "@/features/Timeline/TimelineGroupCard";
import EntryDrawer from "@/features/Timeline/EntryDrawer";
import NotesLayer from "@/features/Notes/NotesLayer";
import { useNotes } from "@/features/Notes/useNotes";
import { useAuth } from "@/contexts/AuthContext";
import { RELATION_STYLE, CONTRADICTS_COLOR } from "@/features/Timeline/timelineLayout";
import Spinner from "@/ui/Spinner";

const PageTitle = tw.h1`text-3xl font-bold text-title mb-2`;
const Subtitle = tw.p`text-sm text-title opacity-60 leading-relaxed mb-5 max-w-2xl`;

// Same card grid as the manuscripts list, so the two libraries read alike.
const Grid = tw.div`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-6`;

const BackBtn = tw.button`
  text-sm text-title opacity-55 hover:opacity-100 transition-opacity mb-3 bg-transparent border-0 cursor-pointer p-0
`;

const Legend = tw.div`flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4`;
const LegendItem = tw.span`flex items-center gap-1.5 text-[11px] text-title opacity-60`;

const Note = tw.p`text-xs text-title opacity-50 mb-4`;
const Empty = tw.p`text-sm text-title opacity-60 py-10`;

// The relation types worth explaining up front. The rest read fine from the
// drawer once an entry is open.
const LEGEND = ["caused", "followed_by", "derived_from", "contradicts"];

export default function Timeline() {
  const { prefs } = usePreferences();
  const { profile } = useAuth();
  // null = gallery of timeline cards; a group id = that group's graph open.
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null);
  // Set once from a deep link (?group=&note=) — e.g. Edit from the notes library.
  const [focusNoteId, setFocusNoteId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const group = searchParams.get("group");
    const note = searchParams.get("note");
    if (group) setActiveId(group);
    if (note) setFocusNoteId(note);
    // Consume the params into state and clean the URL, so the focus fires once.
    if (group || note) setSearchParams({}, { replace: true });
    // Mount only: read the initial params and then drop them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: peoples = [], isLoading: loadingPeoples } = useQuery({
    queryKey: ["all-peoples"],
    queryFn: getAllPeoples,
  });
  const { data: counts = new Map(), isLoading: loadingCounts } = useQuery({
    queryKey: ["entry-counts-by-people"],
    queryFn: getEntryCountsByPeople,
  });
  const { data: ranges = new Map() } = useQuery({
    queryKey: ["entry-period-ranges-by-people"],
    queryFn: getPeriodRangesByPeople,
  });

  // Groups the user actually saved come first; any other group with readable
  // entries stays reachable, so a fresh visitor is never shown an empty page.
  const groups = useMemo(() => {
    const savedIds = new Set(
      (prefs.regions ?? []).filter((r) => r.kind === "people").map((r) => r.id),
    );
    return peoples
      .map((p) => ({
        ...p,
        count: counts.get(p.id) ?? 0,
        range: ranges.get(p.id) ?? null,
        saved: savedIds.has(p.id),
      }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.saved - a.saved || b.count - a.count || a.name.localeCompare(b.name));
  }, [peoples, counts, ranges, prefs.regions]);

  // No fallback to groups[0]: with nothing chosen we show the gallery, not a graph.
  const activeGroup = groups.find((g) => g.id === activeId) ?? null;

  const { data: timeline, isLoading: loadingTimeline } = useQuery({
    queryKey: ["timeline", activeGroup?.id],
    queryFn: () => getTimelineForPeople(activeGroup.id),
    enabled: Boolean(activeGroup),
  });

  const entriesById = useMemo(
    () => new Map((timeline?.entries ?? []).map((e) => [e.id, e])),
    [timeline],
  );

  // What the AI reads to ground a note: the current group's entries by title and
  // summary. Built here where the timeline data already lives, passed down to the
  // notes overlay for its (not-yet-built) AI panel.
  const contextText = useMemo(() => {
    if (!activeGroup || !timeline) return "";
    const lines = (timeline.entries ?? []).map((e) =>
      e.summary ? `${e.title} — ${e.summary}` : e.title,
    );
    return `Timeline: ${activeGroup.name}\n${lines.join("\n")}`;
  }, [activeGroup, timeline]);

  // Shared with NotesLayer via the same react-query key (same user + context), so
  // there is one source of truth. Used to let the entry drawer add a note too.
  const { notes, addNote, atCapacity: notesAtCapacity, isAnon: notesAnon } = useNotes({
    userId: profile?.id,
    contextType: "timeline",
    contextId: activeGroup?.id,
  });
  // For a visitor, hitting the one-note cap is an invitation to sign in, not a
  // dead end — the drawer button reflects that and routes to login.
  const notesNeedLogin = notesAnon && notesAtCapacity;

  // Notes float over the graph and need room — once a note is open, collapse the
  // sidebar. Only fires on the transition (or a load with existing notes); it does
  // not re-collapse if the user later reopens the sidebar with notes still up.
  const { setCollapsed } = useOutletContext();
  useEffect(() => {
    if (notes.length > 0) setCollapsed(true);
  }, [notes.length, setCollapsed]);

  function openGroup(group) {
    setActiveId(group.id);
    setSelected(null);
  }
  function backToGallery() {
    setActiveId(null);
    setSelected(null);
  }

  const navigate = useNavigate();

  function handleAddNoteFromEntry() {
    if (notesNeedLogin) {
      navigate("/login");
      return;
    }
    if (!selected) return;
    // Start empty, but record where it came from (group + entry) so a later Save
    // can file it under that context. The drawer stays open (it sits on the right;
    // new notes spawn top-left, so they don't overlap).
    addNote({
      contextLabel: activeGroup.name,
      sourceEntryId: selected.id,
      sourceEntryTitle: selected.title,
    });
  }

  if (loadingPeoples || loadingCounts) return <Spinner />;

  if (groups.length === 0) {
    return (
      <div>
        <PageTitle>Timelines</PageTitle>
        <Empty>
          No published entries yet. Entries appear here once their workflow status
          is set to published.
        </Empty>
      </div>
    );
  }

  // Gallery: pick a timeline to open.
  if (!activeGroup) {
    return (
      <div>
        <PageTitle>Timelines</PageTitle>
        <Subtitle>
          Each card is a group&apos;s history, arranged by time and joined by the
          relationships between its entries. Open one to explore the graph and take
          notes.
        </Subtitle>
        <Grid>
          {groups.map((g) => (
            <TimelineGroupCard key={g.id} group={g} onOpen={openGroup} />
          ))}
        </Grid>
      </div>
    );
  }

  // Detail: one group's graph.
  return (
    <div>
      <BackBtn type="button" onClick={backToGallery}>
        ← All timelines
      </BackBtn>
      <PageTitle>{activeGroup.name}</PageTitle>
      <Subtitle>
        Entries arranged by time and joined by their relationships — what caused
        what, what followed what, and where accounts contradict each other.
      </Subtitle>

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
        onAddNote={handleAddNoteFromEntry}
        notesAtCapacity={notesAtCapacity}
        notesNeedLogin={notesNeedLogin}
      />

      <NotesLayer
        contextType="timeline"
        contextId={activeGroup.id}
        contextText={contextText}
        focusNoteId={focusNoteId}
      />
    </div>
  );
}
