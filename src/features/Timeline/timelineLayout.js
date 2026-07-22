// Lane assignment for the time-anchored graph.
//
// Rows are chronological (one row per entry, in order). Lanes are horizontal
// position, assigned so that a connected chain of entries stays in the same lane
// and a branch opens a new one — the same idea as a git commit graph.
//
// Rows are ORDINAL, not to scale. A true time axis over this data would put 15 BC
// and 400 AD almost on top of each other and then leave a 400-year gap before
// 843, while cramming 1857–2001 into a sliver. Even spacing keeps every entry
// readable; the year is printed on the card, which is what people actually read.

// Row pitch has to clear a two-line title plus the badge row, or adjacent cards
// touch and the edges between them have nowhere to show.
export const ROW_H = 118;
export const LANE_W = 268;
export const CARD_W = 236;

// Entries with no period_start (oral tradition, 'era'/'relative' precision) can't
// take a position on a chronological axis at all. They are laid out after the
// dated ones and flagged, so the UI can separate them instead of implying a date
// the source never gave.
export function layoutTimeline({ entries, relationships }) {
  const rows = entries.map((entry, i) => ({ entry, row: i, lane: 0 }));
  const rowByEntryId = new Map(rows.map((r) => [r.entry.id, r]));

  // Undirected adjacency: for layout purposes an edge means "these two belong
  // near each other", regardless of which way the relation points.
  const neighbours = new Map();
  const link = (id, node) => {
    if (!neighbours.has(id)) neighbours.set(id, []);
    neighbours.get(id).push(node);
  };
  for (const rel of relationships) {
    const a = rowByEntryId.get(rel.from_entry_id);
    const b = rowByEntryId.get(rel.to_entry_id);
    if (!a || !b || a === b) continue;
    link(a.entry.id, b);
    link(b.entry.id, a);
  }
  const neighboursOf = (node) => neighbours.get(node.entry.id) ?? [];

  // A lane stays RESERVED from a node until its furthest later neighbour is
  // placed, so an unrelated entry falling between the two is pushed into a lane
  // of its own. That reservation is what produces visible branching — without
  // it every node inherits lane 0 and the graph degenerates into a single column.
  const laneBusyUntil = []; // lane -> last row it is still occupied for
  const laneHeldFor = []; // lane -> entry id the lane is being kept for

  for (const node of rows) {
    const earlier = neighboursOf(node)
      .filter((n) => n.row < node.row)
      .sort((a, b) => b.row - a.row);
    const later = neighboursOf(node)
      .filter((n) => n.row > node.row)
      .sort((a, b) => a.row - b.row);

    // Prefer a lane explicitly being held for this entry; otherwise the first
    // lane whose reservation has expired.
    let lane = earlier.find((p) => laneHeldFor[p.lane] === node.entry.id)?.lane;
    if (lane === undefined) {
      lane = 0;
      while (laneBusyUntil[lane] !== undefined && laneBusyUntil[lane] > node.row) lane += 1;
    }

    node.lane = lane;
    laneBusyUntil[lane] = later.length ? later.at(-1).row : node.row;
    laneHeldFor[lane] = later[0]?.entry.id ?? null;
  }

  const laneCount = Math.max(1, laneBusyUntil.length);

  const edges = relationships
    .map((rel) => {
      const from = rowByEntryId.get(rel.from_entry_id);
      const to = rowByEntryId.get(rel.to_entry_id);
      if (!from || !to || from === to) return null;
      return { ...rel, from, to };
    })
    .filter(Boolean);

  return {
    nodes: rows,
    edges,
    laneCount,
    width: laneCount * LANE_W,
    height: rows.length * ROW_H,
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
