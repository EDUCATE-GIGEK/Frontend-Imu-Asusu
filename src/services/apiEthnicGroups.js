import supabase from "./supabase";

export async function getAllEthnicGroups() {
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getEthnicGroup(id) {
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getEthnicGroupsByState(stateId) {
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .eq("state_id", stateId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getEthnicGroupsByLG(lgId) {
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .eq("local_government_id", lgId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}
