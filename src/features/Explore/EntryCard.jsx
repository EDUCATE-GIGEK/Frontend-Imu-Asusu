import { useState } from "react";
import tw from "tailwind-styled-components";
import {
  formatPeriod,
  verificationBadge,
  entryTypeLabel,
} from "./entryFormat";

// A single, richer history fact. Collapsed: type, date, provenance, the
// endangered flag, title and a one-line summary. Expands in place to reveal the
// significance / full body — entries have no detail route, and the temporal /
// relational view lives in Timeline, so inline expansion is the right reveal.

const Card = tw.button`
  w-full text-left flex flex-col gap-1.5 rounded-xl border border-grey-info-outline
  bg-white px-4 py-3 cursor-pointer transition-colors hover:border-orange-accent
`;
const MetaRow = tw.div`flex items-center flex-wrap gap-2`;
const TypeTag = tw.span`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 bg-orange-background-100 text-title`;
const Period = tw.span`text-xs text-title opacity-50`;
const Badge = tw.span`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 border`;
const EndangeredTag = tw.span`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 border border-amber-600/50 text-amber-700`;
const Spring = tw.span`flex-1`;
const Chevron = tw.span`text-title opacity-40 text-xs shrink-0`;
const Title = tw.span`text-sm font-medium text-title`;
const Summary = tw.p`text-sm text-title opacity-60 leading-relaxed`;
const Expanded = tw.div`flex flex-col gap-3 mt-1 pt-3 border-t border-grey-info-outline`;
const FieldLabel = tw.span`block text-[10px] uppercase tracking-wide text-title opacity-40 mb-0.5`;
const FieldText = tw.p`text-sm text-title leading-relaxed`;

export default function EntryCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  const period = formatPeriod(entry);
  const badge = verificationBadge(entry.verification_status);
  const hasDetail = Boolean(entry.significance || entry.body);

  return (
    <Card
      type="button"
      onClick={() => hasDetail && setExpanded((v) => !v)}
      style={hasDetail ? undefined : { cursor: "default" }}
    >
      <MetaRow>
        <TypeTag>{entryTypeLabel(entry.entry_type)}</TypeTag>
        {period && <Period>{period}</Period>}
        <Badge className={badge.className}>{badge.label}</Badge>
        {entry.is_endangered && <EndangeredTag>At risk</EndangeredTag>}
        <Spring />
        {hasDetail && <Chevron>{expanded ? "▲" : "▼"}</Chevron>}
      </MetaRow>

      <Title>{entry.title}</Title>

      {entry.summary && !expanded && <Summary>{entry.summary}</Summary>}

      {expanded && (
        <Expanded>
          {entry.summary && <FieldText>{entry.summary}</FieldText>}
          {entry.significance && (
            <div>
              <FieldLabel>Why it matters</FieldLabel>
              <FieldText>{entry.significance}</FieldText>
            </div>
          )}
          {entry.body && (
            <div>
              <FieldLabel>Detail</FieldLabel>
              <FieldText>{entry.body}</FieldText>
            </div>
          )}
        </Expanded>
      )}
    </Card>
  );
}
