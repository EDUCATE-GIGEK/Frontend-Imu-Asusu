import supabase from "./supabase";

export async function getAllCountries() {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("country_name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getCountry(id) {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCountryByName(name) {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .ilike("country_name", name)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCountriesByContinent(continentId) {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("continent_id", continentId)
    .order("country_name");
  if (error) throw new Error(error.message);
  return data;
}
