import supabase from "./supabase";

// Flat list of all places, for pickers (e.g. the manuscript context selector)
// and the region picker's search index / has-children detection.
export async function getAllPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("id, name, parent_id, designation:designations(label)")
    .order("level_rank", { nullsFirst: false })
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

// A place node plus its level label (Country / State / LGA / …) from the
// designations lookup. Reads the new generalized `places` tree.
export async function getPlace(id) {
  const { data, error } = await supabase
    .from("places")
    .select("*, designation:designations(label)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Direct children of a place (one level down the tree).
export async function getChildPlaces(parentId) {
  const { data, error } = await supabase
    .from("places")
    .select("*, designation:designations(label)")
    .eq("parent_id", parentId)
    .order("level_rank", { nullsFirst: false })
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

// The people groups associated with a place OR any of its descendant places,
// via the recursive peoples_in_place_subtree RPC — so a State surfaces the
// peoples across its LGAs, not only those linked to the state node directly.
export async function getPeoplesInPlace(placeId) {
  const { data, error } = await supabase.rpc("peoples_in_place_subtree", {
    root: placeId,
  });
  if (error) throw new Error(error.message);
  return data;
}
