import supabase from "./supabase";

export async function getWritingAssist({ manuscriptId, content, audience }) {
  const { data, error } = await supabase.functions.invoke("manuscript-writing-assist", {
    body: { manuscriptId, content, audience },
  });

  if (error) throw new Error(await extractFunctionErrorMessage(error));
  return data;
}

// supabase-js doesn't parse the response body on non-2xx function responses —
// the JSON error message our edge functions return lives on error.context.
async function extractFunctionErrorMessage(error) {
  if (error?.context?.json) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch {
      // fall through to the generic message below
    }
  }
  return error.message ?? "Failed to get AI feedback";
}
