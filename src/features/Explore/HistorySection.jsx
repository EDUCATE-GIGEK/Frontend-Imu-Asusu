import { useState } from "react";
import tw from "tailwind-styled-components";
import GroupedList from "@/ui/GroupedList";
import EntryCard from "./EntryCard";
import { facetsFor, entryTypeLabel } from "./entryFormat";

// The redesigned History block, shared by PeoplePage and PlacePage so the two
// stop duplicating it. Exploring = *facts* (this), kept thematic; the temporal /
// relational view is Timeline's job (out of scope here).
//
// Three anti-redundancy moves:
//   1. Thematic faceting — filter by kind of history, never by era.
//   3. Direct vs. sub-group split — the subtree RPC returns descendants too, so
//      a parent would otherwise repeat every child's entries. We separate the
//      entries directly about THIS node from inherited ones (collapsed).
//   4. Endangerment + provenance — surfaced per card (see EntryCard).

const EndangeredNote = tw.div`
  inline-flex items-center gap-2 text-xs text-amber-700 border border-amber-600/40
  rounded-lg px-3 py-1.5 mb-4
`;
const FacetRow = tw.div`flex flex-wrap gap-1.5 mb-4`;
const Chip = tw.button`
  text-[11px] font-semibold uppercase tracking-wide rounded-full px-3 py-1 cursor-pointer
  border transition-colors
`;
const CardList = tw.div`flex flex-col gap-2.5`;
const SubHeading = tw.p`text-[11px] uppercase tracking-wide text-title opacity-40 mt-6 mb-2`;
const MoreBtn = tw.button`
  w-full text-sm font-medium text-title opacity-60 hover:opacity-100 transition-opacity
  border border-dashed border-grey-info-outline rounded-xl px-4 py-3 cursor-pointer mt-6
`;
const EmptyNote = tw.p`text-sm text-title opacity-40`;

const ACTIVE = "bg-orange-background-100 border-orange-accent text-title";
const INACTIVE = "bg-white border-grey-info-outline text-title opacity-60 hover:opacity-100";

export default function HistorySection({ entries, nodeId, nodeKind }) {
  const [facet, setFacet] = useState("all");
  const [showSub, setShowSub] = useState(false);

  const nounLower = nodeKind === "place" ? "place" : "group";

  if (entries.length === 0) {
    return (
      <GroupedList label="History">
        <EmptyNote>No published entries yet for this {nounLower}.</EmptyNote>
      </GroupedList>
    );
  }

  const facets = facetsFor(entries);
  const byFacet = (e) => facet === "all" || e.entry_type === facet;
  const isDirect = (e) =>
    nodeKind === "place" ? e.place_id === nodeId : e.people_id === nodeId;

  const visible = entries.filter(byFacet);
  const direct = visible.filter(isDirect);
  const sub = visible.filter((e) => !isDirect(e));
  const endangeredCount = entries.filter((e) => e.is_endangered).length;

  return (
    <GroupedList label="History">
      {endangeredCount > 0 && (
        <EndangeredNote>
          ▲ {endangeredCount} endangered {endangeredCount === 1 ? "tradition" : "traditions"} — at risk of being lost
        </EndangeredNote>
      )}

      <FacetRow>
        <Chip
          type="button"
          onClick={() => setFacet("all")}
          className={facet === "all" ? ACTIVE : INACTIVE}
        >
          All
        </Chip>
        {facets.map((t) => (
          <Chip
            type="button"
            key={t}
            onClick={() => setFacet(t)}
            className={facet === t ? ACTIVE : INACTIVE}
          >
            {entryTypeLabel(t)}
          </Chip>
        ))}
      </FacetRow>

      {direct.length > 0 ? (
        <CardList>
          {direct.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </CardList>
      ) : (
        sub.length > 0 && (
          <EmptyNote>Nothing recorded directly — see sub-groups below.</EmptyNote>
        )
      )}

      {sub.length > 0 &&
        (showSub ? (
          <>
            <SubHeading>From sub-groups</SubHeading>
            <CardList>
              {sub.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </CardList>
          </>
        ) : (
          <MoreBtn type="button" onClick={() => setShowSub(true)}>
            Show {sub.length} more from sub-groups →
          </MoreBtn>
        ))}
    </GroupedList>
  );
}
