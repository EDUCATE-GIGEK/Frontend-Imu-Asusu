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
