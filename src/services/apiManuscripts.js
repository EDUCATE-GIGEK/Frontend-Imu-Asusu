import supabase from "./supabase";

export async function getManuscripts() {
  const { data, error } = await supabase
    .from("manuscripts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createManuscript({ userId, title, manuscriptDescription, contexts }) {
  const { data, error } = await supabase
    .from("manuscripts")
    .insert({ user_id: userId, title, manuscript_description: manuscriptDescription, contexts })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateManuscript(id, { title, manuscriptDescription, contexts }) {
  const { data, error } = await supabase
    .from("manuscripts")
    .update({ title, manuscript_description: manuscriptDescription, contexts })
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
