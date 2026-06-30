import supabase from "@/services/supabase";

export async function uploadManuscriptFile(userId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("manuscript-files")
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);

  return { path, name: file.name };
}
