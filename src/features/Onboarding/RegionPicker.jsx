import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GoChevronRight, GoCheck, GoX, GoSearch } from "react-icons/go";
import tw from "tailwind-styled-components";
import { getAllPlaces } from "@/services/apiPlaces";
import { getAllPeoples, getAllPeoplePlaces } from "@/services/apiPeoples";
import { getEntryCountsByPeople } from "@/services/apiEntries";
import { buildSuggestedTemplates } from "./regionTemplates";
import Spinner from "@/ui/Spinner";

// ── Region identity ─────────────────────────────────────────────────────────
// A pick is { kind: "place" | "people", id, name }. We key by kind:id so the two
// trees never collide.
const keyOf = (kind, id) => `${kind}:${id}`;

// ── Styled components (match the app theme) ─────────────────────────────────
const Wrap = tw.div`flex flex-col gap-4`;

const ChipRow = tw.div`flex flex-wrap items-center gap-2 min-h-[2.25rem]`;
const ChipsEmpty = tw.span`text-sm text-title opacity-40 italic`;
const Chip = tw.span`
  inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1
  bg-orange-background-100 border border-orange-accent text-sm text-title
`;
const ChipHint = tw.span`text-[11px] not-italic opacity-50`;
const ChipRemove = tw.button`
  flex items-center justify-center w-5 h-5 rounded-full
  bg-transparent border-none cursor-pointer text-title opacity-60 hover:opacity-100
  hover:bg-black/10 transition-all
`;

const SearchBox = tw.div`
  flex items-center gap-2 rounded-xl border border-grey-info-outline bg-white px-3 py-2
  focus-within:border-orange-accent transition-colors
`;
const SearchInput = tw.input`
  flex-1 bg-transparent border-none outline-none text-sm text-title
  placeholder:opacity-40 font-body
`;

const TreeScroll = tw.div`max-h-[22rem] overflow-y-auto pr-1 flex flex-col gap-0.5`;
const GroupLabel = tw.p`text-xs font-semibold text-title opacity-40 uppercase tracking-widest px-1 mt-3 mb-1`;
const GroupCount = tw.span`ml-2 normal-case tracking-normal font-normal opacity-70`;

const Row = tw.div`flex items-center gap-1 rounded-lg hover:bg-black/[0.03] transition-colors`;
const Caret = tw.button`
  flex items-center justify-center w-6 h-8 shrink-0 bg-transparent border-none cursor-pointer
  text-title opacity-40 hover:opacity-100 transition-opacity
`;
const CaretSpacer = tw.div`w-6 shrink-0`;
const SelectArea = tw.button`
  flex flex-1 items-center gap-2.5 text-left bg-transparent border-none cursor-pointer
  px-1 py-1.5 min-w-0
`;
const CheckBox = tw.span`
  flex items-center justify-center w-[18px] h-[18px] shrink-0 rounded-md border transition-colors
  ${(p) => (p.$on ? "bg-orange-accent border-orange-accent text-title" : "bg-white border-grey-info-outline text-transparent")}
`;
const RowName = tw.span`text-sm text-title truncate`;
const RowLabel = tw.span`text-[11px] uppercase tracking-wide text-title opacity-40 shrink-0`;
const EmptyNote = tw.p`text-sm text-title opacity-40 px-1 py-2`;

// ── Component ───────────────────────────────────────────────────────────────
export default function RegionPicker({ value, onChange }) {
  const [expanded, setExpanded] = useState(() => new Set());
  const [search, setSearch] = useState("");

  const { data: places = [], isLoading: loadingPlaces } = useQuery({
    queryKey: ["all-places"],
    queryFn: getAllPlaces,
  });
  const { data: peoples = [], isLoading: loadingPeoples } = useQuery({
    queryKey: ["all-peoples"],
    queryFn: getAllPeoples,
  });
  const { data: peoplePlaces = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["all-people-places"],
    queryFn: getAllPeoplePlaces,
  });
  const { data: entryCounts = new Map(), isLoading: loadingCounts } = useQuery({
    queryKey: ["entry-counts-by-people"],
    queryFn: getEntryCountsByPeople,
  });

  const loading = loadingPlaces || loadingPeoples || loadingLinks || loadingCounts;

  // Index the flat lists into by-id + children-by-parent maps so we can render
  // the tree, detect leaves (no caret), and resolve real names client-side.
  const idx = useMemo(() => build(places, peoples), [places, peoples]);

  // Suggestions are derived from the data, so a newly seeded people group shows
  // up here on its own once its entries are published.
  const suggested = useMemo(
    () => buildSuggestedTemplates({ peoples, places, peoplePlaces, entryCounts }),
    [peoples, places, peoplePlaces, entryCounts],
  );

  const selectedKeys = useMemo(
    () => new Set(value.map((r) => keyOf(r.kind, r.id))),
    [value],
  );

  function toggleExpand(kind, id) {
    const k = keyOf(kind, id);
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  function toggleSelect(kind, node) {
    const k = keyOf(kind, node.id);
    if (selectedKeys.has(k)) {
      onChange(value.filter((r) => keyOf(r.kind, r.id) !== k));
    } else {
      onChange([...value, { kind, id: node.id, name: node.name }]);
    }
  }

  const q = search.trim().toLowerCase();

  // Renders one node (and, when expanded, its children) as an indented row.
  function renderNode(kind, node, depth) {
    const k = keyOf(kind, node.id);
    const children = idx.childrenOf(kind, node.id);
    const isOpen = expanded.has(k);
    const on = selectedKeys.has(k);
    return (
      <div key={k}>
        <Row style={{ paddingLeft: `${depth * 1.25}rem` }}>
          {children.length > 0 ? (
            <Caret type="button" onClick={() => toggleExpand(kind, node.id)} title={isOpen ? "Collapse" : "Expand"}>
              <GoChevronRight
                size={13}
                style={{ transition: "transform 0.2s ease", transform: isOpen ? "rotate(90deg)" : "none" }}
              />
            </Caret>
          ) : (
            <CaretSpacer />
          )}
          <SelectArea type="button" onClick={() => toggleSelect(kind, node)}>
            <CheckBox $on={on}>{on && <GoCheck size={12} />}</CheckBox>
            <RowName>{node.name}</RowName>
            {node.designation?.label && <RowLabel>{node.designation.label}</RowLabel>}
          </SelectArea>
        </Row>
        {isOpen && children.map((c) => renderNode(kind, c, depth + 1))}
      </div>
    );
  }

  // Flat selectable row used by search results and the suggested lineage.
  function renderFlat(kind, node, depth = 0) {
    const k = keyOf(kind, node.id);
    const on = selectedKeys.has(k);
    return (
      <Row key={`flat-${k}`} style={{ paddingLeft: `${depth * 1.25}rem` }}>
        <CaretSpacer />
        <SelectArea type="button" onClick={() => toggleSelect(kind, node)}>
          <CheckBox $on={on}>{on && <GoCheck size={12} />}</CheckBox>
          <RowName>{node.name}</RowName>
          {node.designation?.label && <RowLabel>{node.designation.label}</RowLabel>}
        </SelectArea>
      </Row>
    );
  }

  if (loading) return <Spinner />;

  return (
    <Wrap>
      {/* Selected chips — pinned, removable, with a redundancy hint. */}
      <ChipRow>
        {value.length === 0 ? (
          <ChipsEmpty>No regions selected yet — pick from below.</ChipsEmpty>
        ) : (
          value.map((r) => {
            const insideName = r.kind === "place" ? idx.selectedAncestorName(r.id, selectedKeys) : null;
            return (
              <Chip key={keyOf(r.kind, r.id)}>
                {r.name}
                {insideName && <ChipHint>· inside {insideName}</ChipHint>}
                <ChipRemove type="button" onClick={() => toggleSelect(r.kind, { id: r.id, name: r.name })} title="Remove">
                  <GoX size={13} />
                </ChipRemove>
              </Chip>
            );
          })
        )}
      </ChipRow>

      <SearchBox>
        <GoSearch size={15} className="opacity-40 shrink-0" />
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search regions or peoples…"
        />
        {search && (
          <ChipRemove type="button" onClick={() => setSearch("")} title="Clear">
            <GoX size={13} />
          </ChipRemove>
        )}
      </SearchBox>

      <TreeScroll>
        {q ? (
          <SearchResults idx={idx} q={q} renderFlat={renderFlat} />
        ) : (
          <>
            {/* Suggested: derived per people group, rendered as a pre-expanded
                lineage so the user sees where the group sits before picking. */}
            {suggested.map((tpl) => (
              <div key={tpl.id}>
                <GroupLabel>
                  Suggested — {tpl.label}
                  <GroupCount>
                    {tpl.entryCount} {tpl.entryCount === 1 ? "entry" : "entries"}
                  </GroupCount>
                </GroupLabel>
                {tpl.places.map((p, depth) => renderFlat("place", p, depth))}
                {tpl.peoples.map((p) => renderFlat("people", p, tpl.places.length))}
              </div>
            ))}

            {/* Full browsable tree (collapsed by default). */}
            <GroupLabel>All places</GroupLabel>
            {idx.rootPlaces.length === 0 ? (
              <EmptyNote>No places available yet.</EmptyNote>
            ) : (
              idx.rootPlaces.map((p) => renderNode("place", p, 0))
            )}

            {idx.rootPeoples.length > 0 && (
              <>
                <GroupLabel>All peoples</GroupLabel>
                {idx.rootPeoples.map((p) => renderNode("people", p, 0))}
              </>
            )}
          </>
        )}
      </TreeScroll>
    </Wrap>
  );
}

// Flat search across both trees.
function SearchResults({ idx, q, renderFlat }) {
  const placeHits = idx.places.filter((p) => p.name.toLowerCase().includes(q));
  const peopleHits = idx.peoples.filter((p) => p.name.toLowerCase().includes(q));
  if (placeHits.length === 0 && peopleHits.length === 0) {
    return <EmptyNote>No matches for “{q}”.</EmptyNote>;
  }
  return (
    <>
      {placeHits.length > 0 && <GroupLabel>Places</GroupLabel>}
      {placeHits.map((p) => renderFlat("place", p))}
      {peopleHits.length > 0 && <GroupLabel>Peoples</GroupLabel>}
      {peopleHits.map((p) => renderFlat("people", p))}
    </>
  );
}

// Build lookup structures from the two flat lists.
function build(places, peoples) {
  const placesById = new Map(places.map((p) => [p.id, p]));

  const childrenOf = (kind, id) => {
    const list = kind === "place" ? places : peoples;
    return list.filter((n) => n.parent_id === id);
  };

  // For a selected place, the name of its nearest ancestor that is ALSO selected
  // (so the chip can note "inside Nigeria"). Places only.
  const selectedAncestorName = (id, selectedKeys) => {
    let node = placesById.get(id);
    node = node ? placesById.get(node.parent_id) : null;
    while (node) {
      if (selectedKeys.has(keyOf("place", node.id))) return node.name;
      node = node.parent_id ? placesById.get(node.parent_id) : null;
    }
    return null;
  };

  return {
    places,
    peoples,
    placesById,
    rootPlaces: places.filter((p) => !p.parent_id),
    rootPeoples: peoples.filter((p) => !p.parent_id),
    childrenOf,
    selectedAncestorName,
  };
}
