import supabase from "./supabase";

export async function getAllHistory() {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .order("category");
  if (error) throw new Error(error.message);
  return data;
}

export async function getHistoryByEthnicGroup(ethnicGroupId) {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .eq("ethnic_group_id", ethnicGroupId)
    .order("category");
  if (error) throw new Error(error.message);
  return data;
}
