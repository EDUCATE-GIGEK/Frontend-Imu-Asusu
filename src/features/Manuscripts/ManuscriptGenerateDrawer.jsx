import { useEffect, useState } from "react";
import tw from "tailwind-styled-components";

// ── Styled components ────────────────────────────────────────────────────────
const Backdrop = tw.div`fixed inset-0 z-40 bg-black/30`;
const Panel = tw.aside`
  fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col
  border-l border-grey-info-outline bg-white shadow-xl
`;
const PanelHeader = tw.div`flex items-center justify-between gap-3 border-b border-grey-info-outline px-5 py-4`;
const PanelTitle = tw.p`text-sm font-semibold text-title`;
const CloseBtn = tw.button`text-title opacity-40 hover:opacity-100 bg-transparent border-0 cursor-pointer text-xl leading-none`;
const PanelBody = tw.div`flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5`;
const Hint = tw.p`text-xs text-title opacity-50 leading-relaxed`;
const PromptInput = tw.textarea`
  border border-grey-info-outline rounded-lg px-3 py-2 text-sm text-title resize-y min-h-24
  focus:outline-none focus:border-orange-400
`;
const Row = tw.div`flex items-center justify-between gap-3`;
const SourceNote = tw.p`text-xs text-title opacity-50`;
const GenerateBtn = tw.button`text-xs font-semibold text-white bg-title rounded-lg px-3 py-1.5 cursor-pointer border-0 disabled:opacity-50`;
const Preview = tw.div`border border-grey-info-outline rounded-lg p-3 bg-orange-background-100/40 flex flex-col gap-2`;
const PreviewLabel = tw.p`text-xs font-semibold text-title opacity-60 uppercase tracking-wide`;
const PreviewBody = tw.div`text-sm text-title max-h-64 overflow-y-auto flex flex-col gap-1.5 [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-grey-info-outline [&_blockquote]:pl-3 [&_blockquote]:opacity-80`;
const PreviewActions = tw.div`flex items-center gap-2 pt-1`;
const InsertBtn = tw.button`text-xs font-semibold text-white bg-orange-accent rounded-lg px-3 py-1.5 cursor-pointer border-0`;
const DiscardBtn = tw.button`text-xs font-semibold text-title border border-grey-info-outline rounded-lg px-3 py-1.5 bg-transparent cursor-pointer hover:border-orange-300 transition-colors`;
const ErrorText = tw.p`text-sm text-red-500`;

// Generate is the one deliberate AI surface that writes new prose, so it lives
// in a slide-in drawer rather than a standing panel — it stays out of the
// editor column until the user asks for it.
export default function ManuscriptGenerateDrawer({
  open,
  onClose,
  isPending,
  error,
  result,
  onRun,
  onInsert,
  onDiscard,
}) {
  const [prompt, setPrompt] = useState("");
  const canGenerate = prompt.trim().length > 0 && !isPending;

  // Close on Escape, but never mid-generation — that would strand the request.
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape" && !isPending) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, isPending]);

  if (!open) return null;

  function handleGenerate() {
    if (!canGenerate) return;
    onRun(prompt.trim());
  }

  return (
    <>
      <Backdrop onClick={() => !isPending && onClose()} />
      <Panel role="dialog" aria-label="Generate with AI">
        <PanelHeader>
          <PanelTitle>Generate with AI</PanelTitle>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">×</CloseBtn>
        </PanelHeader>

        <PanelBody>
          <Hint>
            Describe the passage you want — e.g. “Write a short introduction to Ikwerre migration for
            high-school students.” It’s written for the student level you picked and grounded in the
            history records for the contexts you selected.
          </Hint>

          <PromptInput
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should the AI write?"
            disabled={isPending}
            autoFocus
          />

          <Row>
            <SourceNote>{isPending ? "Writing…" : ""}</SourceNote>
            <GenerateBtn type="button" disabled={!canGenerate} onClick={handleGenerate}>
              {isPending ? "Generating…" : "Generate"}
            </GenerateBtn>
          </Row>

          {error && <ErrorText>{error.message}</ErrorText>}

          {result && (
            <Preview>
              <PreviewLabel>Preview</PreviewLabel>
              <PreviewBody dangerouslySetInnerHTML={{ __html: result.generatedText }} />
              <SourceNote>
                {result.sourceCount > 0
                  ? `Grounded in ${result.sourceCount} history record${result.sourceCount === 1 ? "" : "s"}.`
                  : "No history records matched your contexts — this is unsourced structure, not verified facts."}
              </SourceNote>
              <PreviewActions>
                <InsertBtn type="button" onClick={onInsert}>
                  Insert into manuscript
                </InsertBtn>
                <DiscardBtn type="button" onClick={onDiscard}>
                  Discard
                </DiscardBtn>
              </PreviewActions>
            </Preview>
          )}
        </PanelBody>
      </Panel>
    </>
  );
}
