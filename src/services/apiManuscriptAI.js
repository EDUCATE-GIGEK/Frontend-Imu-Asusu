import supabase from "./supabase";

export async function getWritingAssist({ manuscriptId, content, audience }) {
  const { data, error } = await supabase.functions.invoke("manuscript-writing-assist", {
    body: { manuscriptId, content, audience },
  });

  if (error) throw new Error(await extractFunctionErrorMessage(error));
  return data;
}

// Checks the draft's claims against the history records for the manuscript's
// selected contexts. `contexts` is the live form selection rather than the saved
// row, so an unsaved draft can still be checked.
export async function getFactCheck({ manuscriptId, content, contexts }) {
  const { data, error } = await supabase.functions.invoke("manuscript-fact-check", {
    body: { manuscriptId, content, contexts },
  });

  if (error) throw new Error(await extractFunctionErrorMessage(error));
  return data;
}

// Generates a new passage from the user's prompt, grounded in the history
// records for the manuscript's selected contexts and pitched at `audience`.
// `existingContent` is the current draft, passed for continuity of voice.
export async function getGenerate({ manuscriptId, prompt, mode = "content", existingContent, contexts, audience }) {
  const { data, error } = await supabase.functions.invoke("manuscript-generate", {
    body: { manuscriptId, prompt, mode, existingContent, contexts, audience },
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
