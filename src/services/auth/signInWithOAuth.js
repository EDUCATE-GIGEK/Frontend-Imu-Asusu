import supabase from "@/services/supabase";

export async function signInWithOAuth({ provider = "google", redirectTo = `${window.location.origin}/app` } = {}) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) throw new Error(error.message);
}
