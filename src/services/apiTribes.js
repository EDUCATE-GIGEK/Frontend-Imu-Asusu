import supabase from "./supabase";

export async function getAllTribes() {
  const { data, error } = await supabase
    .from("tribes")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getTribe(id) {
  const { data, error } = await supabase
    .from("tribes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getTribesByEthnicGroup(ethnicGroupId) {
  const { data, error } = await supabase
    .from("tribes")
    .select("*")
    .eq("ethnic_group_id", ethnicGroupId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}
