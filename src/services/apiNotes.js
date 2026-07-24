import supabase from "./supabase";

// Notes are scoped to a surface: a timeline (people group) or a learning module.
// Callers pass the app user's id (public.user.id, bigint) — same as manuscripts.

// Every saved note the user owns, across all contexts — for the notes library
// page. Drafts never appear here; they live only in localStorage until saved.
export async function getNotesByUser(userId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getNotes({ userId, contextType, contextId }) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createNote({
  userId,
  contextType,
  contextId,
  body = "",
  posX,
  posY,
  zIndex,
  contextLabel = null,
  sourceEntryId = null,
  sourceEntryTitle = null,
}) {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      context_type: contextType,
      context_id: contextId,
      body,
      pos_x: posX,
      pos_y: posY,
      z_index: zIndex,
      context_label: contextLabel,
      source_entry_id: sourceEntryId,
      source_entry_title: sourceEntryTitle,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Partial patch: only the provided fields are written (body edits vs. drag moves
// vs. z-index bumps all flow through here without clobbering the others).
export async function updateNote(id, patch) {
  const row = {};
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.posX !== undefined) row.pos_x = patch.posX;
  if (patch.posY !== undefined) row.pos_y = patch.posY;
  if (patch.zIndex !== undefined) row.z_index = patch.zIndex;
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("notes")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNote(id) {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
