import tw from "tailwind-styled-components";
import { GoX } from "react-icons/go";
import { formatPeriod, eraLabel, entryTypeLabel } from "@/features/Explore/entryFormat";
import { RELATION_STYLE } from "./timelineLayout";

// A side drawer rather than a bottom sheet: the graph stays visible while an
// entry is open, so the reader keeps the context of where this entry sits.
const Panel = tw.aside`
  fixed top-0 right-0 bottom-0 w-full sm:w-[26rem] bg-white z-50
  border-l border-grey-info-outline flex flex-col
`;
const Head = tw.div`flex items-start justify-between gap-3 px-5 py-4 border-b border-grey-info-outline`;
const HeadText = tw.div`min-w-0`;
const Year = tw.p`font-heading text-xs font-bold text-title opacity-45 tabular-nums`;
const Title = tw.h3`font-heading text-lg font-bold text-title leading-snug mt-0.5`;
const CloseBtn = tw.button`
  shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-transparent
  border border-grey-info-outline cursor-pointer text-title opacity-60
  hover:opacity-100 transition-opacity
`;
const Body = tw.div`px-5 py-4 overflow-y-auto flex-1 flex flex-col gap-5`;
const Section = tw.div``;
const Label = tw.p`text-[11px] uppercase tracking-wide text-title opacity-40 mb-1.5`;
const Text = tw.p`text-sm text-title leading-relaxed`;
const MetaRow = tw.div`flex flex-wrap gap-1.5`;
const Tag = tw.span`
  text-[11px] rounded px-2 py-0.5 border border-grey-info-outline text-title opacity-70
`;
const Warn = tw.div`
  text-xs leading-relaxed text-title rounded-md border border-amber-600 px-3 py-2
`;
const RelItem = tw.div`flex items-baseline gap-2 text-sm text-title py-1`;
const RelKind = tw.span`text-[11px] uppercase tracking-wide opacity-40 shrink-0 w-[5.5rem]`;
const RelTitle = tw.button`
  text-left bg-transparent border-none p-0 cursor-pointer text-sm text-title
  underline decoration-grey-info-outline underline-offset-2 hover:decoration-title
`;
const Foot = tw.div`px-5 py-4 border-t border-grey-info-outline`;
const NotesBtn = tw.button`
  w-full bg-title text-white text-sm font-semibold px-4 py-2 rounded-md
  border-0 cursor-pointer opacity-40 cursor-not-allowed
`;

export default function EntryDrawer({ entry, relationships, entriesById, onSelect, onClose }) {
  if (!entry) return null;

  const connected = relationships
    .filter((r) => r.from_entry_id === entry.id || r.to_entry_id === entry.id)
    .map((r) => {
      const outgoing = r.from_entry_id === entry.id;
      const other = entriesById.get(outgoing ? r.to_entry_id : r.from_entry_id);
      if (!other) return null;
      const style = RELATION_STYLE[r.relation_type] ?? { label: r.relation_type };
      return {
        id: r.id,
        other,
        note: r.note,
        label: outgoing ? style.label : `${style.label} (from)`,
      };
    })
    .filter(Boolean);

  return (
    <Panel>
      <Head>
        <HeadText>
          <Year>{formatPeriod(entry) ?? "Undated"}</Year>
          <Title>{entry.title}</Title>
        </HeadText>
        <CloseBtn type="button" onClick={onClose} title="Close">
          <GoX size={14} />
        </CloseBtn>
      </Head>

      <Body>
        <MetaRow>
          <Tag>{entryTypeLabel(entry.entry_type)}</Tag>
          {eraLabel(entry.era) && <Tag>{eraLabel(entry.era)}</Tag>}
          {entry.date_precision && <Tag>{entry.date_precision} precision</Tag>}
          {entry.is_endangered && <Tag>endangered</Tag>}
        </MetaRow>

        {/* Provenance is stated before the content, not buried under it — the
            reader should know how solid a claim is before they read it. */}
        {entry.verification_status === "disputed" && (
          <Warn>
            <strong>Contested.</strong> Accounts of this disagree. What follows is
            one account among others, not a settled conclusion.
          </Warn>
        )}
        {entry.verification_status === "unverified" && (
          <Warn>
            <strong>Unverified.</strong> Drafted but not yet corroborated against
            independent sources. Treat as provisional.
          </Warn>
        )}

        {entry.summary && (
          <Section>
            <Label>Summary</Label>
            <Text>{entry.summary}</Text>
          </Section>
        )}

        {entry.body && (
          <Section>
            <Label>Detail</Label>
            <Text>{entry.body}</Text>
          </Section>
        )}

        {entry.significance && (
          <Section>
            <Label>Why it matters</Label>
            <Text>{entry.significance}</Text>
          </Section>
        )}

        {entry.period_note && (
          <Section>
            <Label>On the dating</Label>
            <Text>{entry.period_note}</Text>
          </Section>
        )}

        {connected.length > 0 && (
          <Section>
            <Label>Connected entries</Label>
            {connected.map((c) => (
              <RelItem key={c.id}>
                <RelKind>{c.label}</RelKind>
                <RelTitle type="button" onClick={() => onSelect(c.other)}>
                  {c.other.title}
                </RelTitle>
              </RelItem>
            ))}
          </Section>
        )}
      </Body>

      <Foot>
        <NotesBtn type="button" disabled title="Notes are not built yet">
          Take notes — coming next
        </NotesBtn>
      </Foot>
    </Panel>
  );
}
