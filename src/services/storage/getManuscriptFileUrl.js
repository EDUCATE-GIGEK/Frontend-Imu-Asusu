import supabase from "@/services/supabase";

export async function getManuscriptFileUrl(path) {
  const { data, error } = await supabase.storage
    .from("manuscript-files")
    .createSignedUrl(path, 60 * 60); // 1-hour expiry

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
