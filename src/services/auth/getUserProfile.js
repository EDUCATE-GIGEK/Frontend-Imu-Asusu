import supabase from "@/services/supabase";

export async function getUserProfile(authId) {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("auth_id", authId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
