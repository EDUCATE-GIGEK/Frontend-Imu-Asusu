import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getGenerate } from "@/services/apiManuscriptAI";

/**
 * Owns AI content-generation for one manuscript editor session. Unlike
 * writing-assist and fact-check, generation produces new text rather than
 * overlaying suggestions on the draft — so this hook just holds the latest
 * generated passage for preview. The editor performs the actual insertion
 * (it holds the document); this hook only reflects the result and clears it
 * once inserted or discarded.
 */
export function useManuscriptGenerate({ manuscriptId }) {
  const [result, setResult] = useState(null); // { generatedText, sourceCount } | null

  const mutation = useMutation({
    mutationFn: ({ prompt, contexts, audience, existingContent }) =>
      getGenerate({ manuscriptId, prompt, contexts, audience, existingContent }),
    onSuccess: (data) => setResult({ generatedText: data.generatedText, sourceCount: data.sourceCount ?? 0 }),
  });

  const run = useCallback(
    (prompt, { contexts, audience, existingContent } = {}) =>
      mutation.mutate({ prompt, contexts, audience, existingContent }),
    [mutation],
  );

  // Drop the current preview — called after the passage is inserted or discarded
  // so it can't be inserted twice. Also resets the mutation's error/success flags.
  const clear = useCallback(() => {
    setResult(null);
    mutation.reset();
  }, [mutation]);

  return {
    run,
    clear,
    isPending: mutation.isPending,
    error: mutation.error,
    result,
  };
}
