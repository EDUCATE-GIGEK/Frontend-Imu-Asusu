import tw from "tailwind-styled-components";

// ── Styled components ────────────────────────────────────────────────────────
const Bar = tw.div`
  flex items-center justify-between gap-3 flex-wrap
  rounded-lg border border-grey-info-outline bg-white px-4 py-2.5
`;
const Segments = tw.div`flex items-center gap-x-2 gap-y-1 flex-wrap min-w-0 text-sm text-title`;
const Segment = tw.span`inline-flex items-center gap-1`;
const SegLabel = tw.span`opacity-50`;
const SegValue = tw.span`font-medium`;
const Dot = tw.span`opacity-30`;
const EmptyNote = tw.span`text-sm text-title opacity-40 italic`;
const EditBtn = tw.button`
  shrink-0 text-xs font-semibold text-title border border-grey-info-outline rounded-lg px-3 py-1.5
  hover:border-orange-300 transition-colors bg-transparent cursor-pointer
`;

// Resolve selected ids to their human-readable labels, capping how many names
// we spell out so the bar stays one line; the rest collapse to "+N".
function summarize(items, itemLabel, selected, max = 2) {
  const picked = items.filter((item) => selected.includes(String(item.id)));
  if (picked.length === 0) return null;
  const names = picked.slice(0, max).map((item) => item[itemLabel]);
  const extra = picked.length - names.length;
  return extra > 0 ? `${names.join(", ")} +${extra}` : names.join(", ");
}

// Compact, one-line read-out of the manuscript's details — contexts, student
// level, and attached file. The [Edit details] button hands off to the drawer
// where all of it (plus the title) is edited; the editor stays the focus.
export default function ManuscriptContextBar({ groups, educationLabel, attachedFileName, onEdit }) {
  const segments = groups
    .map((g) => ({ label: g.label, value: summarize(g.items, g.itemLabel, g.selected) }))
    .filter((s) => s.value);

  if (educationLabel) segments.push({ label: "Level", value: educationLabel });
  if (attachedFileName) segments.push({ label: "File", value: attachedFileName });

  return (
    <Bar>
      {segments.length === 0 ? (
        <EmptyNote>No context selected yet</EmptyNote>
      ) : (
        <Segments>
          {segments.map((s, i) => (
            <Segment key={s.label}>
              {i > 0 && <Dot>·</Dot>}
              <SegLabel>{s.label}:</SegLabel>
              <SegValue>{s.value}</SegValue>
            </Segment>
          ))}
        </Segments>
      )}
      <EditBtn type="button" onClick={onEdit}>Edit details</EditBtn>
    </Bar>
  );
}
