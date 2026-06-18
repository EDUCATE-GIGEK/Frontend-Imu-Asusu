import supabase from "./supabase";

export async function getAllContinents() {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .order("continent_name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getContinent(id) {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
