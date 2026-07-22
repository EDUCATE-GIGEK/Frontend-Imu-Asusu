import { useMemo } from "react";
import tw from "tailwind-styled-components";
import {
  layoutTimeline,
  CARD_W,
  CARD_H,
  RELATION_STYLE,
  EDGE_COLOR,
  CONTRADICTS_COLOR,
} from "./timelineLayout";
// Shared with Explore — the same entry renders the same date string in both
// surfaces, and BCE / approximate / era-fallback handling lives in one place.
import { formatPeriod } from "@/features/Explore/entryFormat";

// The canvas is centred in the page so the spine sits down the middle; it only
// scrolls sideways when branches make it wider than the available column.
const Scroll = tw.div`overflow-x-auto pb-4 flex justify-center`;
const Canvas = tw.div`relative shrink-0`;

const Card = tw.button`
  absolute text-left bg-white border rounded-md px-3 py-2.5 cursor-pointer
  transition-colors font-body
  ${(p) =>
    p.$selected
      ? "border-title"
      : "border-grey-info-outline hover:border-title/40 hover:bg-orange-background-100/40"}
`;
const CardYear = tw.p`font-heading text-xs font-bold text-title opacity-45 mb-0.5 tabular-nums`;
const CardTitle = tw.p`text-[13px] font-semibold text-title leading-snug line-clamp-2`;
const CardFoot = tw.div`flex items-center gap-1.5 mt-1.5`;
const Pill = tw.span`
  text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border
  ${(p) =>
    p.$tone === "disputed"
      ? "border-amber-600 text-amber-700"
      : p.$tone === "verified"
        ? "border-grey-info-outline text-title opacity-55"
        : "border-grey-info-outline text-title opacity-40"}
`;

const Empty = tw.p`text-sm text-title opacity-50 py-8`;

// Edge from the bottom of one card to the top of the next. Time runs down, so
// the earlier endpoint always leaves from its bottom edge regardless of which
// way the relation points — a `derived_from` running back up the page still
// attaches at the two cards' facing edges rather than doubling through them.
//
// Same lane and adjacent: a straight drop down the spine.
// Same lane but distant: an arc bowed out to the side, so the line does not cut
// straight through every card sitting between the two endpoints.
// Different lane: a bezier, reading as a departure from the spine.
function edgePath(a, b) {
  const [from, to] = a.step <= b.step ? [a, b] : [b, a];
  const x1 = from.x + CARD_W / 2;
  const y1 = from.y + CARD_H;
  const x2 = to.x + CARD_W / 2;
  const y2 = to.y;

  if (from.offset === to.offset) {
    const gap = to.step - from.step;
    if (gap <= 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
    // Bow away from centre so the arc clears the intervening cards.
    const direction = from.offset >= 0 ? 1 : -1;
    const bow = direction * (CARD_W / 2 + 26 + gap * 4);
    return `M ${x1} ${y1} C ${x1 + bow} ${y1}, ${x2 + bow} ${y2}, ${x2} ${y2}`;
  }

  const mid = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
}

export default function TimelineGraph({ timeline, selectedId, onSelect }) {
  const { nodes, edges, width, height } = useMemo(
    () => layoutTimeline(timeline),
    [timeline],
  );

  if (nodes.length === 0) {
    return (
      <Empty>
        Nothing published for this group yet. Entries still in review are hidden
        until they are published.
      </Empty>
    );
  }

  return (
    <Scroll>
      <Canvas style={{ width, height }}>
        <svg
          width={width}
          height={height}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="tl-arrow"
              viewBox="0 0 8 8"
              refX="6"
              refY="4"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill={EDGE_COLOR} opacity="0.45" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const style = RELATION_STYLE[edge.relation_type] ?? RELATION_STYLE.related_to;
            const contradicts = edge.relation_type === "contradicts";
            const touchesSelection =
              selectedId &&
              (edge.from.entry.id === selectedId || edge.to.entry.id === selectedId);
            return (
              <path
                key={edge.id}
                d={edgePath(edge.from, edge.to)}
                fill="none"
                stroke={contradicts ? CONTRADICTS_COLOR : EDGE_COLOR}
                strokeWidth={touchesSelection ? style.width + 0.75 : style.width}
                strokeDasharray={style.dash ?? undefined}
                opacity={selectedId ? (touchesSelection ? 0.95 : 0.1) : contradicts ? 0.85 : 0.55}
                markerEnd={contradicts ? undefined : "url(#tl-arrow)"}
              />
            );
          })}
        </svg>

        {nodes.map(({ entry, x, y }) => (
          <Card
            key={entry.id}
            type="button"
            $selected={entry.id === selectedId}
            onClick={() => onSelect(entry)}
            style={{ left: x, top: y, width: CARD_W, height: CARD_H }}
          >
            {/* Undated is a real state here, not missing data — oral tradition
                often carries no year at all. Say so rather than showing blank. */}
            <CardYear>{formatPeriod(entry) ?? "Undated"}</CardYear>
            <CardTitle>{entry.title}</CardTitle>
            <CardFoot>
              {entry.verification_status !== "unverified" && (
                <Pill $tone={entry.verification_status}>{entry.verification_status}</Pill>
              )}
              {entry.is_endangered && <Pill>endangered</Pill>}
            </CardFoot>
          </Card>
        ))}
      </Canvas>
    </Scroll>
  );
}
