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
