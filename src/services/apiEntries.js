import supabase from "./supabase";

// Entries about a place AND all of its descendant places, via the recursive
// `entries_in_place_subtree` RPC. RLS applies, so anonymous callers only get
// published, non-restricted entries.
export async function getEntriesInPlaceSubtree(placeId) {
  const { data, error } = await supabase.rpc("entries_in_place_subtree", {
    root: placeId,
  });
  if (error) throw new Error(error.message);
  return data;
}

// Entries about a people group AND all of its descendant groups, via the
// recursive `entries_in_people_subtree` RPC. RLS applies (published only for anon).
export async function getEntriesInPeopleSubtree(peopleId) {
  const { data, error } = await supabase.rpc("entries_in_people_subtree", {
    root: peopleId,
  });
  if (error) throw new Error(error.message);
  return data;
}

// How many *visible* entries each people group has, as a Map(people_id -> count).
//
// RLS does the filtering, which is the point: a group whose entries are all still
// in_review counts as 0, so anything derived from this — like the onboarding
// suggestions — can never point a new user at a group with nothing to read.
export async function getEntryCountsByPeople() {
  const { data, error } = await supabase
    .from("entries")
    .select("people_id")
    .not("people_id", "is", null);
  if (error) throw new Error(error.message);

  const counts = new Map();
  for (const { people_id } of data ?? []) {
    counts.set(people_id, (counts.get(people_id) ?? 0) + 1);
  }
  return counts;
}

// Earliest / latest year each people group's visible entries cover, as a
// Map(people_id -> { min, max }). Groups whose entries are all undated (no
// period_start/_end — common for oral tradition) simply don't appear. Same
// RLS-filtered read as the counts, used to label the timeline gallery cards.
export async function getPeriodRangesByPeople() {
  const { data, error } = await supabase
    .from("entries")
    .select("people_id, period_start, period_end")
    .not("people_id", "is", null);
  if (error) throw new Error(error.message);

  const ranges = new Map();
  for (const { people_id, period_start, period_end } of data ?? []) {
    const years = [period_start, period_end].filter((y) => y != null);
    if (years.length === 0) continue;
    const cur = ranges.get(people_id) ?? { min: Infinity, max: -Infinity };
    for (const y of years) {
      cur.min = Math.min(cur.min, y);
      cur.max = Math.max(cur.max, y);
    }
    ranges.set(people_id, cur);
  }
  return ranges;
}
