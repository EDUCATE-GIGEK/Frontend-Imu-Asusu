import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getFactCheck } from "@/services/apiManuscriptAI";

// The editor's decoration class is derived from `category`, so each verdict gets
// its own category and can be underlined in its own colour.
const CATEGORY = {
  supported: "fact-supported",
  contradicted: "fact-contradicted",
  no_evidence: "fact-no-evidence",
};

// Shape the edge function's { claims, sources } into flat editor-ready items:
// stable ids, a per-verdict category, the cited record labels, and UI state.
function flatten(data) {
  const sourceById = new Map((data.sources ?? []).map((s) => [s.id, s]));

  return (data.claims ?? []).map((claim, i) => ({
    id: `fact-${i}`,
    category: CATEGORY[claim.verdict] ?? CATEGORY.no_evidence,
    verdict: claim.verdict,
    excerpt: claim.excerpt,
    // Only a contradiction carries a drop-in fix; the editor's apply command
    // reads `replacement`, and leaving it empty is what makes the other two
    // verdicts read-only in the popover.
    replacement: claim.verdict === "contradicted" ? claim.correction : "",
    issue: claim.explanation,
    sources: (claim.sourceIds ?? [])
      .map((id) => sourceById.get(id))
      .filter(Boolean),
    status: "active",
    matched: undefined,
  }));
}

/**
 * Owns fact-check state for one manuscript editor session: runs the check
 * against the history records for the manuscript's selected contexts, tracks
 * which claims the editor could locate in the draft, and records apply/dismiss
 * outcomes. The editor holds the document, so it performs the apply/dismiss —
 * this hook only reflects the result. Mirrors useManuscriptWritingAssist.
 */
export function useManuscriptFactCheck({ manuscriptId }) {
  const [items, setItems] = useState([]);
  const [sourceCount, setSourceCount] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ content, contexts }) => getFactCheck({ manuscriptId, content, contexts }),
    onSuccess: (data) => {
      setItems(flatten(data));
      setSourceCount(data.sourceCount ?? 0);
    },
  });

  const run = useCallback(
    (content, contexts) => mutation.mutate({ content, contexts }),
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

  const reset = useCallback(() => {
    setItems([]);
    setSourceCount(null);
  }, []);

  const activeItems = useMemo(() => items.filter((it) => it.status === "active"), [items]);

  // Stable-identity payload for the editor: keyed on id+excerpt so toggling a
  // claim's `matched` flag (via setLocated) doesn't retrigger a rebuild and
  // cause a locate/setLocated feedback loop.
  const editorKey = activeItems.map((it) => `${it.id}:${it.excerpt}`).join("|");
  const editorSuggestions = useMemo(
    () =>
      activeItems.map(({ id, category, excerpt, replacement, verdict, issue, sources }) => ({
        id,
        category,
        excerpt,
        replacement,
        verdict,
        issue,
        sources,
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
    // 0 means the selected contexts have no history records behind them, so the
    // draft went unchecked — the panel says so rather than implying a clean bill.
    sourceCount,
    editorSuggestions,
    setLocated,
    resolve,
    reset,
  };
}
