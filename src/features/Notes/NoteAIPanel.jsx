import { useState } from "react";
import tw from "tailwind-styled-components";
import { getNoteAssist } from "@/services/apiNotesAI";

// The in-note AI control: a single prompt + send. The model infers what the
// learner wants (write / answer / summarize / improve) and returns the text plus
// where it goes — this component just fires the request and hands the result up.
//
// Props:
//   body         current note text.
//   contextText  surrounding surface content for grounding.
//   onResult     (text, action) => void — action is 'append' | 'replace'.
const Bar = tw.div`flex flex-col gap-1.5 px-2 py-2 border-t border-grey-info-outline`;
const Field = tw.div`flex items-end gap-1.5`;
const Input = tw.textarea`
  flex-1 min-w-0 resize-none leading-snug text-xs px-2 py-1.5 rounded border border-grey-info-outline
  bg-white/70 outline-none focus:border-orange-300 placeholder:text-title/35 disabled:opacity-50
`;
const Send = tw.button`
  shrink-0 flex items-center justify-center w-8 h-8 rounded border border-grey-info-outline bg-white/60
  text-title/70 hover:bg-orange-300/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors
`;
const Err = tw.p`text-[11px] text-red-500 leading-snug`;

export default function NoteAIPanel({ body, contextText, onResult }) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    const text = prompt.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await getNoteAssist({ prompt: text, body, contextText });
      onResult(res.text, res.action);
      setPrompt("");
      setExpanded(false);
    } catch (e) {
      setError(e.message ?? "AI request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Bar>
      <Field>
        <Input
          rows={expanded ? 3 : 1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to write, answer, summarize, improve… (Shift+Enter to expand)"
          disabled={loading}
          onKeyDown={(e) => {
            // Shift+Enter expands the prompt into a multi-line box (and adds a
            // newline); Enter alone sends.
            if (e.key === "Enter" && e.shiftKey) {
              setExpanded(true);
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          onBlur={() => setExpanded(false)}
        />
        <Send
          type="button"
          onClick={submit}
          disabled={loading || !prompt.trim()}
          aria-label="Send to AI"
          title="Send to AI"
        >
          {loading ? "…" : "↵"}
        </Send>
      </Field>
      {error && <Err>{error}</Err>}
    </Bar>
  );
}
