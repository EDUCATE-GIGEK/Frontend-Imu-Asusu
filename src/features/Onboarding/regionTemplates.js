// Suggested region lineages for the onboarding picker.
//
// These are DERIVED from the database, never hardcoded. Any people group that
// has visible (published, non-restricted) entries becomes suggestible on its
// own, ranked by how much there is to read, and carries its place lineage
// resolved by walking `parent_id` up from its homeland.
//
// The practical consequence: seeding a new group is enough. Add the Rumantschs,
// publish their entries, and they appear here — no id to copy, no file to edit,
// nothing to go stale when the database is reseeded. The previous version of
// this file held hand-written UUIDs that silently dropped out of the UI whenever
// they drifted.

// How many groups to surface. Beyond ~3 the "suggested" section stops being a
// shortcut and just duplicates the full tree below it.
const MAX_SUGGESTED = 3;

// Walk a place up to its root, returning the chain parent → child so the
// lineage reads top-down (Europe → Switzerland → Graubünden).
function lineageOf(placeId, placesById) {
  const chain = [];
  let node = placesById.get(placeId);
  // Guard against a cyclic parent_id rather than hanging the picker.
  const seen = new Set();
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    chain.unshift(node);
    node = node.parent_id ? placesById.get(node.parent_id) : null;
  }
  return chain;
}

// Prefer the homeland link; fall back to any association so a group with only
// diaspora/historical places still gets a lineage instead of none.
function anchorPlaceIdFor(peopleId, peoplePlaces) {
  const links = peoplePlaces.filter((pp) => pp.people_id === peopleId);
  const homeland = links.find((pp) => pp.relationship === "homeland");
  return (homeland ?? links[0])?.place_id ?? null;
}

export function buildSuggestedTemplates({
  peoples = [],
  places = [],
  peoplePlaces = [],
  entryCounts = new Map(),
  limit = MAX_SUGGESTED,
}) {
  const placesById = new Map(places.map((p) => [p.id, p]));

  return peoples
    .map((people) => ({ people, entryCount: entryCounts.get(people.id) ?? 0 }))
    // A group with nothing readable is not a suggestion, it's a dead end.
    .filter(({ entryCount }) => entryCount > 0)
    .sort(
      (a, b) =>
        b.entryCount - a.entryCount || a.people.name.localeCompare(b.people.name),
    )
    .slice(0, limit)
    .map(({ people, entryCount }) => {
      const anchorId = anchorPlaceIdFor(people.id, peoplePlaces);
      return {
        id: people.id,
        label: people.name,
        entryCount,
        places: anchorId ? lineageOf(anchorId, placesById) : [],
        peoples: [people],
      };
    });
}
