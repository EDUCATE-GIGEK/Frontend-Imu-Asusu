import supabase from "./supabase";

// Everything Collaborate needs on top of the private manuscript library:
// reading the public pool, upvoting, forking, and counting views. Ranking is
// deliberately not here — it depends on the reader's saved regions, which live
// in localStorage, so it happens client-side (see features/Collaborate/relevance).

// Every public manuscript, newest first. The author is embedded through the
// explicit FK name because `user` is also a schema-qualified keyword.
export async function getPublicManuscripts() {
  const { data, error } = await supabase
    .from("manuscripts")
    .select("*, author:user!manuscripts_user_id_fkey(id, name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// The manuscript ids this user has already upvoted, so the button can render
// its pressed state. RLS keeps this to rows the reader is allowed to see.
export async function getMyUpvotedIds(userId) {
  const { data, error } = await supabase
    .from("manuscript_upvotes")
    .select("manuscript_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data.map((row) => row.manuscript_id);
}

// Upvote / un-upvote. `manuscripts.upvote_count` is kept in sync by a trigger,
// so callers only need to refetch the manuscript list afterwards.
export async function addUpvote({ manuscriptId, userId }) {
  const { error } = await supabase
    .from("manuscript_upvotes")
    .insert({ manuscript_id: manuscriptId, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function removeUpvote({ manuscriptId, userId }) {
  const { error } = await supabase
    .from("manuscript_upvotes")
    .delete()
    .eq("manuscript_id", manuscriptId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// Copies a public manuscript's text into a new private manuscript owned by the
// caller and bumps the source's fork_count — one transaction, server-side,
// because the forker has no write access to the source row. Files are not copied.
export async function forkManuscript(manuscriptId) {
  const { data, error } = await supabase.rpc("fork_manuscript", {
    p_manuscript_id: manuscriptId,
  });
  if (error) throw new Error(error.message);
  return data;
}

// Fire-and-forget: a failed view count must never block opening a manuscript.
export async function incrementManuscriptView(manuscriptId) {
  const { error } = await supabase.rpc("increment_manuscript_view", {
    p_manuscript_id: manuscriptId,
  });
  if (error) console.warn("view count not recorded:", error.message);
}
