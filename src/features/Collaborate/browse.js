// Search + sort for Collaborate's browse-everything list. Kept separate from
// relevance.js because this is what the reader asks for explicitly, whereas
// relevance is what we infer for them.

export const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "upvotes", label: "Most upvoted" },
  { value: "alphabetical", label: "A–Z" },
  { value: "oldest", label: "Oldest" },
];

// Matches on the fields a reader can actually see on a card, plus the author's
// name — searching for a colleague is the other obvious way in.
export function matchesQuery(manuscript, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [manuscript.title, manuscript.summary, manuscript.author?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(q));
}

const comparators = {
  recent: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  upvotes: (a, b) =>
    (b.upvote_count ?? 0) - (a.upvote_count ?? 0) ||
    new Date(b.created_at) - new Date(a.created_at),
  alphabetical: (a, b) =>
    (a.title ?? "").localeCompare(b.title ?? "", undefined, { sensitivity: "base" }),
};

export function browseManuscripts(manuscripts, { query = "", level = "", sort = "recent" } = {}) {
  return manuscripts
    .filter((m) => matchesQuery(m, query))
    .filter((m) => !level || m.education_level === level)
    .sort(comparators[sort] ?? comparators.recent);
}
