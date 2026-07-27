import { useState } from "react";
import { GoSearch, GoX } from "react-icons/go";
import tw from "tailwind-styled-components";
import GroupedList from "@/ui/GroupedList";
import EntryCard from "./EntryCard";
import { facetsFor, entryTypeLabel } from "@/utils/entryFormat";

// The redesigned History block. Lives here under features/PlacePage, but is
// ALSO used on PeoplePage (src/pages/PeoplePage.jsx) — a shared feature filed
// under one of its two consuming pages by convention. Exploring = *facts*
// (this), kept thematic; the temporal / relational view is Timeline's job
// (out of scope here).
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
const SearchBox = tw.div`
  flex items-start gap-2 rounded-xl border border-grey-info-outline bg-white px-3.5 py-2.5 mb-3 max-w-md
  focus-within:border-orange-accent transition-colors
`;
const SearchInput = tw.textarea`
  flex-1 min-w-0 resize-none leading-snug bg-transparent border-none outline-none text-base text-title
  placeholder:opacity-40 font-body
`;
const ClearBtn = tw.button`shrink-0 text-title opacity-40 hover:opacity-100 bg-transparent border-none cursor-pointer`;
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
const INACTIVE =
  "bg-white border-grey-info-outline text-title opacity-60 hover:opacity-100";

const stripHtml = (s) => (s ?? "").replace(/<[^>]*>/g, " ");

export default function HistorySection({ entries, nodeId, nodeKind }) {
  const [facet, setFacet] = useState("all");
  const [query, setQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
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
  // Search across every entry in this group's history, over all its text.
  const q = query.trim().toLowerCase();
  const bySearch = (e) => {
    if (!q) return true;
    return [
      e.title,
      e.summary,
      e.significance,
      stripHtml(e.body),
      entryTypeLabel(e.entry_type),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  };
  const isDirect = (e) =>
    nodeKind === "place" ? e.place_id === nodeId : e.people_id === nodeId;

  const visible = entries.filter(byFacet).filter(bySearch);
  const direct = visible.filter(isDirect);
  const sub = visible.filter((e) => !isDirect(e));
  const endangeredCount = entries.filter((e) => e.is_endangered).length;

  return (
    <GroupedList label="History">
      {endangeredCount > 0 && (
        <EndangeredNote>
          ▲ {endangeredCount} endangered{" "}
          {endangeredCount === 1 ? "tradition" : "traditions"} — at risk of
          being lost
        </EndangeredNote>
      )}

      <SearchBox>
        <GoSearch size={15} className="opacity-40 shrink-0" />
        <SearchInput
          rows={searchExpanded ? 3 : 1}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for historical entries"
          onKeyDown={(e) => {
            // Shift+Enter grows the box; plain Enter does nothing (search is live).
            if (e.key === "Enter" && e.shiftKey) setSearchExpanded(true);
            else if (e.key === "Enter") e.preventDefault();
          }}
          onBlur={() => setSearchExpanded(false)}
        />
        {query && (
          <ClearBtn type="button" onClick={() => setQuery("")} title="Clear">
            <GoX size={14} />
          </ClearBtn>
        )}
      </SearchBox>

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

      {visible.length === 0 ? (
        <EmptyNote>No entries match your search.</EmptyNote>
      ) : direct.length > 0 ? (
        <CardList>
          {direct.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </CardList>
      ) : (
        sub.length > 0 && (
          <EmptyNote>
            Nothing recorded directly — see sub-groups below.
          </EmptyNote>
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
