import { useState } from "react";
import tw from "tailwind-styled-components";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";

// A navigable list (Places / People) with a History-style facet chip row on top:
// "All" plus one chip per distinct category present. Category is whatever the
// caller derives via `categoryOf` (e.g. a place's level, a people's designation).

const FacetRow = tw.div`flex flex-wrap gap-1.5 mb-3`;
const Chip = tw.button`
  text-[11px] font-semibold uppercase tracking-wide rounded-full px-3 py-1 cursor-pointer
  border transition-colors
`;
const ACTIVE = "bg-orange-background-100 border-orange-accent text-title";
const INACTIVE = "bg-white border-grey-info-outline text-title opacity-60 hover:opacity-100";

export default function FacetedNavList({ label, items, categoryOf, to }) {
  const [facet, setFacet] = useState("all");
  if (items.length === 0) return null;

  const cats = [];
  for (const it of items) {
    const c = categoryOf(it);
    if (c && !cats.includes(c)) cats.push(c);
  }
  const active = facet !== "all" && cats.includes(facet);
  const shown = active ? items.filter((it) => categoryOf(it) === facet) : items;

  return (
    <GroupedList label={label}>
      {cats.length > 0 && (
        <FacetRow>
          <Chip type="button" onClick={() => setFacet("all")} className={!active ? ACTIVE : INACTIVE}>
            All
          </Chip>
          {cats.map((c) => (
            <Chip
              key={c}
              type="button"
              onClick={() => setFacet(c)}
              className={facet === c ? ACTIVE : INACTIVE}
            >
              {c}
            </Chip>
          ))}
        </FacetRow>
      )}
      <Spacer>
        {shown.map((it) => (
          <InfoOption key={it.id} label={it.name} onClick={() => to(it)} />
        ))}
      </Spacer>
    </GroupedList>
  );
}
