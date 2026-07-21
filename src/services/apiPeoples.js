import supabase from "./supabase";

// Flat list of all peoples, for pickers (e.g. the manuscript context selector)
// and the region picker's search index / has-children detection.
export async function getAllPeoples() {
  const { data, error } = await supabase
    .from("peoples")
    .select("id, name, parent_id, designation:designations(label)")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

// A people node plus its level label (Ethnic Group / Clan / …) from the
// designations lookup. Reads the new generalized `peoples` tree.
export async function getPeople(id) {
  const { data, error } = await supabase
    .from("peoples")
    .select("*, designation:designations(label)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Direct sub-groups of a people (one level down the tree).
export async function getChildPeoples(parentId) {
  const { data, error } = await supabase
    .from("peoples")
    .select("*, designation:designations(label)")
    .eq("parent_id", parentId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

// The places a people is associated with (homeland / diaspora / …), via the
// people_places link. Flattened to place rows carrying the relationship.
export async function getPlacesForPeople(peopleId) {
  const { data, error } = await supabase
    .from("people_places")
    .select("relationship, place:places(id, name, designation:designations(label))")
    .eq("people_id", peopleId);
  if (error) throw new Error(error.message);
  return (data ?? [])
    .filter((row) => row.place)
    .map((row) => ({ ...row.place, relationship: row.relationship }));
}

// The languages of a people.
export async function getLanguagesForPeople(peopleId) {
  const { data, error } = await supabase
    .from("languages")
    .select("id, name, classification, endangerment_status")
    .eq("people_id", peopleId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

// Notable figures of a people (Eze, founders, …). RLS hides restricted rows.
export async function getFiguresForPeople(peopleId) {
  const { data, error } = await supabase
    .from("figures")
    .select("id, name, role")
    .eq("people_id", peopleId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}
