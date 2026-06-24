import supabase from "@/services/supabase";

export async function signInWithOtp({ email }) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw new Error(error.message);
}
