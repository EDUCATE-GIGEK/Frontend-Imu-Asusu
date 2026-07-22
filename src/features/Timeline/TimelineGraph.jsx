import { useMemo } from "react";
import tw from "tailwind-styled-components";
import {
  layoutTimeline,
  ROW_H,
  LANE_W,
  CARD_W,
  RELATION_STYLE,
  EDGE_COLOR,
  CONTRADICTS_COLOR,
} from "./timelineLayout";
// Shared with Explore — the same entry renders the same date string in both
// surfaces, and BCE / approximate / era-fallback handling lives in one place.
import { formatPeriod } from "@/features/Explore/entryFormat";

const Scroll = tw.div`overflow-x-auto pb-4`;
const Canvas = tw.div`relative`;

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

// Edge from the bottom of one card to the top of another. Same lane draws a
// straight drop; a lane change bows sideways so parallel edges stay tellable
// apart instead of overlapping into one thick line.
function edgePath(from, to) {
  const x1 = from.lane * LANE_W + CARD_W / 2;
  const y1 = from.row * ROW_H + ROW_H - 22;
  const x2 = to.lane * LANE_W + CARD_W / 2;
  const y2 = to.row * ROW_H + 4;

  if (from.lane === to.lane) return `M ${x1} ${y1} L ${x2} ${y2}`;
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

        {nodes.map(({ entry, row, lane }) => (
          <Card
            key={entry.id}
            type="button"
            $selected={entry.id === selectedId}
            onClick={() => onSelect(entry)}
            style={{
              top: row * ROW_H,
              left: lane * LANE_W,
              width: CARD_W,
            }}
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
