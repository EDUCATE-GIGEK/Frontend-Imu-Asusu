import supabase from "@/services/supabase";
import { clearPreferences } from "@/services/preferences";

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  // Drop the local mirror of this user's regions and intent. Their account
  // keeps them, so signing back in restores everything — but the next person on
  // a shared machine doesn't inherit the last one's interests.
  clearPreferences();
}
