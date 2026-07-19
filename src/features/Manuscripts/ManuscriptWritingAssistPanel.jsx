import tw from "tailwind-styled-components";

const Panel = tw.div`border border-grey-info-outline rounded-lg p-4 flex flex-col gap-3`;
const Header = tw.div`flex items-center justify-between gap-3`;
const Title = tw.p`text-sm font-semibold text-title`;
const AssistBtn = tw.button`text-xs font-semibold text-title border border-grey-info-outline rounded-lg px-3 py-1.5 hover:border-orange-300 transition-colors bg-transparent cursor-pointer disabled:opacity-50`;
const Hint = tw.p`text-xs text-title opacity-50`;
const SectionTitle = tw.p`text-xs font-semibold text-title opacity-60 uppercase tracking-wide`;
const SuggestionList = tw.ul`flex flex-col gap-2`;
const SuggestionItem = tw.li`
  text-sm text-title bg-orange-background-100/50 rounded-lg p-2.5
  data-[resolved=true]:opacity-40
`;
const Old = tw.p`italic opacity-70 line-through`;
const New = tw.p`font-medium`;
const Issue = tw.p`opacity-80 text-xs mt-0.5`;
const StatusNote = tw.p`text-xs mt-1 opacity-60`;
const EmptyText = tw.p`text-sm text-title opacity-40`;
const ErrorText = tw.p`text-sm text-red-500`;

const STATUS_LABEL = {
  applied: "✓ Applied",
  dismissed: "Dismissed",
};

function Suggestion({ item }) {
  const resolved = item.status === "applied" || item.status === "dismissed";
  return (
    <SuggestionItem data-resolved={resolved}>
      <Old>{item.excerpt}</Old>
      <New>→ {item.replacement ? item.replacement : <em className="opacity-60">(remove)</em>}</New>
      {item.issue && <Issue>{item.issue}</Issue>}
      {resolved ? (
        <StatusNote>{STATUS_LABEL[item.status]}</StatusNote>
      ) : item.matched === false ? (
        <StatusNote>Couldn’t locate this text in the draft — it may have been edited.</StatusNote>
      ) : (
        <StatusNote>Click the highlight in the text to apply or dismiss.</StatusNote>
      )}
    </SuggestionItem>
  );
}

export default function ManuscriptWritingAssistPanel({ hasContent, isPending, error, items, hasRun, onRun }) {
  const tone = items.filter((i) => i.category === "tone");
  const grammar = items.filter((i) => i.category === "grammar");
  const nothingFound = hasRun && items.length === 0;

  return (
    <Panel>
      <Header>
        <Title>AI writing assist</Title>
        <AssistBtn type="button" disabled={!hasContent || isPending} onClick={onRun}>
          {isPending ? "Checking…" : "Get AI feedback"}
        </AssistBtn>
      </Header>

      {error && <ErrorText>{error.message}</ErrorText>}

      {items.length > 0 && (
        <Hint>Suggestions are underlined in the text — click one to see the change and apply it.</Hint>
      )}

      {nothingFound && <EmptyText>No tone or grammar issues found.</EmptyText>}

      {tone.length > 0 && (
        <div>
          <SectionTitle>Tone</SectionTitle>
          <SuggestionList>
            {tone.map((item) => (
              <Suggestion key={item.id} item={item} />
            ))}
          </SuggestionList>
        </div>
      )}

      {grammar.length > 0 && (
        <div>
          <SectionTitle>Grammar</SectionTitle>
          <SuggestionList>
            {grammar.map((item) => (
              <Suggestion key={item.id} item={item} />
            ))}
          </SuggestionList>
        </div>
      )}
    </Panel>
  );
}
