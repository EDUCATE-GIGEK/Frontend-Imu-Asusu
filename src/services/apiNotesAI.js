import supabase from "./supabase";

// In-note AI assist. Mirrors the manuscript AI pattern: the client invokes a
// deployed edge function, passing the note body plus the surrounding context so
// the model is grounded in wherever the note was made.
//
// One request per prompt — the model infers intent (write / answer / summarize /
// improve) and returns { text, action } where action is 'append' | 'replace',
// telling the caller how to place the result in the note.
// contextType/contextId/contextText describe the surface (timeline group or
// learning module) the note sits on.
export async function getNoteAssist({ prompt, body, contextType, contextId, contextText }) {
  const { data, error } = await supabase.functions.invoke("notes-ai", {
    body: { prompt, body, contextType, contextId, contextText },
  });
  if (error) throw new Error(await extractFunctionErrorMessage(error));
  return data;
}

// supabase-js doesn't parse the body on non-2xx function responses — the JSON
// error our edge functions return lives on error.context. (Same shape as
// apiManuscriptAI.js; kept local to avoid coupling the two services.)
async function extractFunctionErrorMessage(error) {
  if (error?.context?.json) {
    try {
      const { error: message } = await error.context.json();
      if (message) return message;
    } catch {
      // fall through to the generic message
    }
  }
  return error?.message ?? "AI request failed";
}
