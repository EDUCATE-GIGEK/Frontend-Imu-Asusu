// Ranking for the "For you" shelf on Collaborate.
//
// A manuscript's score is dominated by whether it covers a region the reader
// actually saved during onboarding — that is the signal that makes the shelf
// feel personal. Community signals (forks, upvotes, views) only break the tie
// between manuscripts that are equally on-topic, and are weighted in that order
// because forking costs more effort than upvoting, which costs more than
// reading. A view is one distinct reader (never the author), so the counts are
// comparable across manuscripts. When two score identically the newer one wins,
// so a fresh contribution is never buried under an equally-relevant older one.

const REGION_WEIGHT = 10;
const FORK_WEIGHT = 3;
const UPVOTE_WEIGHT = 2;
const VIEW_WEIGHT = 0.1;

export const FOR_YOU_LIMIT = 10;

// Saved regions are { kind: 'place' | 'people', id, name }; a manuscript's
// contexts are { places: id[], peoples: id[] }. Both sides are stringified
// because prefs come back from JSON and context ids are stored as strings.
function regionOverlap(manuscript, regions) {
  if (!regions?.length) return 0;
  const places = new Set((manuscript.contexts?.places ?? []).map(String));
  const peoples = new Set((manuscript.contexts?.peoples ?? []).map(String));
  return regions.filter((r) =>
    r.kind === "people" ? peoples.has(String(r.id)) : places.has(String(r.id)),
  ).length;
}

export function scoreManuscript(manuscript, regions) {
  const matches = regionOverlap(manuscript, regions);
  return {
    matches,
    score:
      matches * REGION_WEIGHT +
      (manuscript.fork_count ?? 0) * FORK_WEIGHT +
      (manuscript.upvote_count ?? 0) * UPVOTE_WEIGHT +
      (manuscript.view_count ?? 0) * VIEW_WEIGHT,
  };
}

// The reader's own public manuscripts are excluded — Collaborate's shelf is for
// discovering other people's work; your own stays in your library (and still
// shows up when browsing everything).
export function rankForYou(manuscripts, regions, currentUserId, limit = FOR_YOU_LIMIT) {
  return manuscripts
    .filter((m) => m.user_id !== currentUserId)
    .map((m) => ({ ...m, ...scoreManuscript(m, regions) }))
    .sort(
      (a, b) =>
        b.score - a.score || new Date(b.created_at) - new Date(a.created_at),
    )
    .slice(0, limit);
}
