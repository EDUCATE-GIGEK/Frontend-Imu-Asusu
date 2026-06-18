import supabase from "./supabase";

export async function getAllLocalGovernments() {
  const { data, error } = await supabase
    .from("local_governments")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getLocalGovernment(id) {
  const { data, error } = await supabase
    .from("local_governments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getLGsByState(stateId) {
  const { data, error } = await supabase
    .from("local_governments")
    .select("*")
    .eq("state_id", stateId)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}
