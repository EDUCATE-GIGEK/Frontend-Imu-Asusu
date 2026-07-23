// Lane assignment for the time-anchored graph.
//
// Time runs DOWN the page: `step` is chronological position (y), `lane` is which
// branch a node sits on (x). Lane 0 is the main line and is CENTRED, with
// branches alternating to its right and left — so the spine reads straight down
// the middle of the page and side threads are visibly departures from it.
//
// Steps are ORDINAL, not to scale. A true time axis over this data would put
// 15 BC and 400 AD almost on top of each other, leave a 400-year gap before 843,
// then cram 1857–2001 into a sliver. Even spacing keeps every entry readable and
// the year is printed on the card, which is what people actually read.

export const CARD_W = 236;
export const CARD_H = 92;

// Pitch between chronological steps and between branch lanes. Both need to clear
// the card plus enough gap for an edge to be visible running between them.
export const STEP_H = CARD_H + 46;
export const LANE_W = CARD_W + 56;

// Lanes alternate around the centre: 0 stays on the spine, 1 goes right, 2 left,
// 3 further right, and so on. Keeps the main line centred however many branches
// open, instead of letting the graph drift off to one side.
// Clear space either side of the card columns. Edges spanning more than
// LONG_SPAN rows are routed out here rather than drawn across the cards between
// their endpoints — an entry can legitimately point at another fifteen centuries
// away, and a straight line for that reads as a scribble through the timeline.
export const GUTTER = 78;
export const LONG_SPAN = 3;

export function laneOffset(lane) {
  if (lane === 0) return 0;
  const distance = Math.ceil(lane / 2);
  return lane % 2 === 1 ? distance : -distance;
}

// Undated entries (oral tradition, 'era'/'relative' precision) can't take a
// position on a chronological axis at all. They sort to the end and are counted
// separately, so the UI can say so rather than implying a date no source gave.
export function layoutTimeline({ entries, relationships }) {
  const nodes = entries.map((entry, i) => ({ entry, step: i, lane: 0 }));
  const nodeByEntryId = new Map(nodes.map((n) => [n.entry.id, n]));

  // Undirected adjacency: for layout purposes an edge means "these two belong
  // near each other", regardless of which way the relation points.
  const neighbours = new Map();
  const link = (id, node) => {
    if (!neighbours.has(id)) neighbours.set(id, []);
    neighbours.get(id).push(node);
  };
  for (const rel of relationships) {
    const a = nodeByEntryId.get(rel.from_entry_id);
    const b = nodeByEntryId.get(rel.to_entry_id);
    if (!a || !b || a === b) continue;
    link(a.entry.id, b);
    link(b.entry.id, a);
  }
  const neighboursOf = (node) => neighbours.get(node.entry.id) ?? [];

  // A lane stays RESERVED from a node until its furthest later neighbour is
  // placed, so an unrelated entry falling between the two is pushed onto a lane
  // of its own. That reservation is what produces visible branching — without it
  // every node inherits lane 0 and the graph degenerates into a straight line.
  const laneBusyUntil = []; // lane -> last step it is still occupied for
  const laneHeldFor = []; // lane -> entry id the lane is being kept for

  for (const node of nodes) {
    const earlier = neighboursOf(node)
      .filter((n) => n.step < node.step)
      .sort((a, b) => b.step - a.step);
    const later = neighboursOf(node)
      .filter((n) => n.step > node.step)
      .sort((a, b) => a.step - b.step);

    // Prefer a lane explicitly being held for this entry; otherwise the first
    // lane whose reservation has expired.
    let lane = earlier.find((p) => laneHeldFor[p.lane] === node.entry.id)?.lane;
    if (lane === undefined) {
      lane = 0;
      while (laneBusyUntil[lane] !== undefined && laneBusyUntil[lane] > node.step) lane += 1;
    }

    node.lane = lane;
    // Reserve only as far as the NEAREST later neighbour, not the furthest. A
    // long-duration entry holding the main lane for its whole edge range shoves
    // the chronological spine down into a branch lane and makes the timeline
    // hard to follow. Long-range edges are drawn as arcs over the top instead.
    laneBusyUntil[lane] = later.length ? later[0].step : node.step;
    laneHeldFor[lane] = later[0]?.entry.id ?? null;
  }

  // Resolve lanes to signed offsets around the centre. The canvas is padded
  // SYMMETRICALLY — half the width either side of lane 0 — so the spine lands
  // dead centre even when every branch happens to open on the same side. Without
  // this the canvas centres but the main line sits visibly off to one edge.
  const offsets = nodes.map((n) => laneOffset(n.lane));
  const half = Math.max(0, ...offsets.map(Math.abs));

  for (const node of nodes) {
    node.offset = laneOffset(node.lane);
    node.x = GUTTER + (node.offset + half) * LANE_W + (LANE_W - CARD_W) / 2;
    node.y = node.step * STEP_H;
  }

  // Which (lane, step) cells actually hold a card. An edge only needs to be bent
  // if something is genuinely in its way — bending on distance alone produces
  // C-shaped detours around empty space, because the rows an edge spans usually
  // hold their cards on OTHER lanes.
  const occupied = new Set(nodes.map((n) => `${n.offset}:${n.step}`));
  const isBlocked = (offset, fromStep, toStep) => {
    for (let step = fromStep + 1; step < toStep; step += 1) {
      if (occupied.has(`${offset}:${step}`)) return true;
    }
    return false;
  };

  const edges = relationships
    .map((rel) => {
      const a = nodeByEntryId.get(rel.from_entry_id);
      const b = nodeByEntryId.get(rel.to_entry_id);
      if (!a || !b || a === b) return null;
      // Always draw earlier → later; the relation's own direction is carried by
      // its arrowhead and label, not by which way the line is built.
      const [from, to] = a.step <= b.step ? [a, b] : [b, a];
      const span = to.step - from.step;

      const blocked =
        isBlocked(from.offset, from.step, to.step) ||
        isBlocked(to.offset, from.step, to.step);

      let route;
      if (!blocked) {
        // Clear path: the shortest line that reaches, whatever the distance.
        route = from.offset === to.offset ? "straight" : "bezier";
      } else if (span > LONG_SPAN) {
        // A modest bow over a long span lands the line in the gap between the
        // card columns, which reads worse than either a straight line or a clean
        // detour. Long obstructed edges go out to the margin instead.
        route = "gutter";
      } else {
        route = from.offset === to.offset ? "arc" : "bezier";
      }

      return { ...rel, from, to, span, route };
    })
    .filter(Boolean);

  return {
    nodes,
    edges,
    laneCount: Math.max(1, laneBusyUntil.length),
    width: (2 * half + 1) * LANE_W + 2 * GUTTER,
    height: nodes.length * STEP_H,
  };
}

// How each relationship type is drawn. Direction and meaning have to survive at a
// glance, so the *kind* of line carries the meaning rather than colour alone —
// colour-only encoding would fail for colour-blind readers and in print.
export const RELATION_STYLE = {
  caused:       { dash: null,    width: 1.75, label: "caused" },
  followed_by:  { dash: null,    width: 1,    label: "followed by" },
  part_of:      { dash: "1 3",   width: 1,    label: "part of" },
  derived_from: { dash: "5 3",   width: 1.25, label: "derived from" },
  related_to:   { dash: "2 4",   width: 1,    label: "related to" },
  commemorates: { dash: "5 3",   width: 1,    label: "commemorates" },
  contradicts:  { dash: "6 3",   width: 1.75, label: "contradicts" },
};

// Only `contradicts` gets a colour of its own: it is the one relation that means
// the two entries disagree, and losing it in a sea of identical grey lines would
// hide exactly the thing the model exists to surface.
export const CONTRADICTS_COLOR = "#b45309";
export const EDGE_COLOR = "#0f172a";
