import supabase from "./supabase";

export async function getAllStates() {
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .order("state_name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getState(id) {
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getStatesByCountry(countryId) {
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .eq("country_id", countryId)
    .order("state_name");
  if (error) throw new Error(error.message);
  return data;
}
