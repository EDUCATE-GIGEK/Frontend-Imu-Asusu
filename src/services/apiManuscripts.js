import supabase from "./supabase";

export async function getManuscripts() {
  const { data, error } = await supabase
    .from("manuscripts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getManuscriptsByUser(userId) {
  const { data, error } = await supabase
    .from("manuscripts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createManuscript({ userId, title, manuscriptDescription, contexts, filePath, fileName }) {
  const { data, error } = await supabase
    .from("manuscripts")
    .insert({ user_id: userId, title, manuscript_description: manuscriptDescription, contexts, file_path: filePath ?? null, file_name: fileName ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateManuscript(id, { title, manuscriptDescription, contexts, filePath, fileName }) {
  const patch = { title, manuscript_description: manuscriptDescription, contexts };
  if (filePath !== undefined) patch.file_path = filePath;
  if (fileName !== undefined) patch.file_name = fileName;
  const { data, error } = await supabase
    .from("manuscripts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteManuscript(id) {
  const { error } = await supabase
    .from("manuscripts")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
