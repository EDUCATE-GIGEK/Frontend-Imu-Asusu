import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getWritingAssist } from "@/services/apiManuscriptAI";

// Flatten the edge function's { toneSuggestions, grammarIssues } into a single
// list with stable ids, a category, and UI state (status + match flag).
function flatten(data) {
  const tone = (data.toneSuggestions ?? []).map((s, i) => ({ ...s, id: `tone-${i}`, category: "tone" }));
  const grammar = (data.grammarIssues ?? []).map((s, i) => ({ ...s, id: `grammar-${i}`, category: "grammar" }));
  return [...tone, ...grammar].map((s) => ({ ...s, status: "active", matched: undefined }));
}

/**
 * Owns writing-assist suggestion state for one manuscript editor session:
 * runs the AI call, tracks which suggestions the editor could locate, and
 * records apply/dismiss outcomes. Apply/dismiss themselves are performed by the
 * editor (it holds the document); this hook only reflects the result.
 */
export function useManuscriptWritingAssist({ manuscriptId }) {
  const [items, setItems] = useState([]);

  const mutation = useMutation({
    mutationFn: ({ content, audience }) => getWritingAssist({ manuscriptId, content, audience }),
    onSuccess: (data) => setItems(flatten(data)),
  });

  const run = useCallback(
    (content, audience) => mutation.mutate({ content, audience }),
    [mutation],
  );

  // Called by the editor after it resolves excerpts against the document.
  const setLocated = useCallback((located) => {
    setItems((prev) =>
      prev.map((it) => {
        const match = located.find((l) => l.id === it.id);
        return match ? { ...it, matched: match.matched } : it;
      }),
    );
  }, []);

  const resolve = useCallback((id, action) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: action } : it)));
  }, []);

  const reset = useCallback(() => setItems([]), []);

  const activeItems = useMemo(() => items.filter((it) => it.status === "active"), [items]);

  // Stable-identity payload for the editor: keyed on id+excerpt so toggling a
  // suggestion's `matched` flag (via setLocated) doesn't retrigger a rebuild and
  // cause a locate/setLocated feedback loop.
  const editorKey = activeItems.map((it) => `${it.id}:${it.excerpt}`).join("|");
  const editorSuggestions = useMemo(
    () =>
      activeItems.map(({ id, category, excerpt, replacement, issue }) => ({
        id,
        category,
        excerpt,
        replacement,
        issue,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorKey],
  );

  return {
    run,
    isPending: mutation.isPending,
    error: mutation.error,
    hasRun: mutation.isSuccess,
    items,
    editorSuggestions,
    setLocated,
    resolve,
    reset,
  };
}
