import supabase from "@/services/supabase";

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return session;
}
