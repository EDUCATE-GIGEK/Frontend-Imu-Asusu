import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import tw from "tailwind-styled-components";
import { GoPlus, GoX, GoGlobe, GoPeople } from "react-icons/go";
import usePreferences from "@/hooks/usePreferences";
import { getAllPlaces } from "@/services/apiPlaces";
import { getAllPeoplePlaces } from "@/services/apiPeoples";
import Spinner from "@/ui/Spinner";

// Intent → hero subtitle + the order suggestion tiles appear in.
const INTENT_COPY = {
  teach: "Build teaching materials from the histories you care about.",
  research: "Trace connections across sources, peoples and places.",
  explore: "Wander the histories that spark your curiosity.",
};

const SUGGESTIONS = {
  timeline: {
    to: "/app/my-timeline",
    label: "Timelines",
    blurb: "Explore a people's history as a connected, time-anchored graph.",
  },
  learning: {
    to: "/app/my-learning",
    label: "Learning",
    blurb: "Study the histories you care about and take notes as you go.",
  },
  collaborations: {
    to: "/app/collaborate",
    label: "Collaborate",
    blurb: "Read, fork and build on manuscripts other educators have shared.",
  },
};

// What to suggest, tailored to who they are (intent). Teachers=teach,
// researchers=research, students=explore.
const SUGGESTIONS_BY_INTENT = {
  explore: ["timeline", "learning"],
  teach: ["collaborations", "timeline", "learning"],
  research: ["timeline"],
};
const DEFAULT_SUGGESTIONS = ["timeline", "learning"];

// ── Styled components ───────────────────────────────────────────────────────
const Header = tw.h1`font-heading text-4xl font-bold text-title mb-1`;
const Subtitle = tw.p`text-base text-title opacity-70 mb-10 font-heading italic`;

const SectionHead = tw.div`flex items-center justify-between mb-3`;
const SectionTitle = tw.h2`text-2xl font-bold text-title`;
const AddLink = tw(Link)`
  inline-flex items-center gap-1 text-sm font-medium text-title opacity-60
  hover:opacity-100 transition-opacity no-underline
`;

const RegionGroups = tw.div`flex flex-col gap-5 mb-12`;
const ContinentLabel = tw.p`text-xs font-semibold text-title opacity-40 uppercase tracking-widest mb-2`;
const RegionGrid = tw.div`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3`;
const RegionCard = tw.div`
  group relative flex flex-col gap-1.5 rounded-xl border border-grey-info-outline bg-white
  pl-4 pr-3 py-3 hover:border-orange-accent hover:bg-orange-background-100 transition-colors
`;
const RegionTop = tw.div`flex items-center gap-3`;
const RegionLink = tw(Link)`flex flex-1 items-center gap-3 no-underline min-w-0`;
// Associated places for a people, pinned bottom-right, one per line.
const Assoc = tw.div`self-end text-right flex flex-col gap-1`;
const AssocLine = tw.span`text-[11px] text-title opacity-70 font-body leading-snug`;
const RegionIcon = tw.span`flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-orange-background-100 text-title`;
const RegionName = tw.span`text-sm font-medium text-title truncate`;
const RegionKind = tw.span`block text-[11px] uppercase tracking-wide text-title opacity-40`;
const RemoveBtn = tw.button`
  flex items-center justify-center w-6 h-6 rounded-full shrink-0 opacity-0 group-hover:opacity-60
  hover:opacity-100! hover:bg-black/10 transition-all bg-transparent border-none cursor-pointer text-title
`;

const EmptyState = tw.div`rounded-xl border border-dashed border-grey-info-outline px-6 py-8 text-center mb-12`;
const EmptyText = tw.p`text-sm text-title opacity-60 mb-4 font-body not-italic`;
const CtaBtn = tw(Link)`
  inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold no-underline
  bg-orange-accent text-title hover:brightness-95 transition-all
`;

// Suggestions read as stacked entries — a name over its description — not cards.
const SuggestList = tw.div`flex flex-col gap-4`;
const SuggestItem = tw.div`flex flex-col gap-0.5`;
const SuggestName = tw(Link)`w-fit font-heading text-base font-semibold text-title no-underline hover:text-orange-accent transition-colors`;
const SuggestNameStatic = tw.span`inline-flex items-center w-fit font-heading text-base font-semibold text-title`;
const SoonTag = tw.span`ml-2 text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 bg-orange-background-100 opacity-70`;
const SuggestDesc = tw.span`text-sm text-title opacity-60`;

export default function Home() {
  const { prefs, save } = usePreferences();
  const { regions, intent } = prefs;

  const suggestions = SUGGESTIONS_BY_INTENT[intent] ?? DEFAULT_SUGGESTIONS;

  // Ancestry data to resolve each saved region to its continent. These queries are
  // usually already warm from the region picker, so this rarely refetches.
  const { data: places = [], isLoading: loadingPlaces } = useQuery({
    queryKey: ["all-places"],
    queryFn: getAllPlaces,
  });
  const { data: peoplePlaces = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["all-people-places"],
    queryFn: getAllPeoplePlaces,
  });

  // Grouping and associations need this ancestry data; until it's in, hold the
  // section so it renders grouped in one shot rather than flashing an ungrouped grid.
  const loadingGeo = loadingPlaces || loadingLinks;

  const placesById = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);

  // The continent a place sits under (its root), or itself for a continent.
  function rootOf(placeId) {
    let node = placesById.get(placeId);
    while (node?.parent_id) node = placesById.get(node.parent_id);
    return node ?? null;
  }

  // A place's path as "Country . Place" — the top two levels below the continent.
  // Two levels is intentional; anything deeper is trimmed to that. The redundant
  // " State" suffix (Nigerian states) is dropped, so "Rivers State" reads "Rivers".
  function placePath(placeId) {
    const chain = [];
    let node = placesById.get(placeId);
    while (node) {
      chain.push(node.name.replace(/\s+State$/i, ""));
      node = node.parent_id ? placesById.get(node.parent_id) : null;
    }
    // chain is bottom-up ending at the continent; drop it, go top-down, keep two.
    return chain.slice(0, -1).reverse().slice(0, 2).join(" . ");
  }

  // The places a people is associated with (its people_places links), each as a
  // "Country.Place" path. Places have none — they are a location, not associated.
  function associationsOf(r) {
    if (r.kind !== "people") return [];
    const paths = peoplePlaces
      .filter((pp) => pp.people_id === r.id)
      .map((pp) => placePath(pp.place_id))
      .filter(Boolean);
    return [...new Set(paths)].sort();
  }

  // Group saved regions by continent: a place walks up its own ancestry to the
  // root (the continent); a people resolves via its homeland place. Until the
  // places load, everything sits in one unlabelled group so the list still shows.
  const grouped = useMemo(() => {
    const ready = placesById.size > 0;
    const byContinent = new Map();
    for (const r of regions) {
      let continent = null;
      if (ready) {
        if (r.kind === "place") {
          continent = rootOf(r.id);
        } else {
          const link = peoplePlaces.find((pp) => pp.people_id === r.id);
          continent = link ? rootOf(link.place_id) : null;
        }
      }
      const name = ready ? continent?.name ?? "Other" : null;
      if (!byContinent.has(name)) byContinent.set(name, { name, regions: [] });
      byContinent.get(name).regions.push(r);
    }
    return [...byContinent.values()].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? ""),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, placesById, peoplePlaces]);

  function renderRegion(r) {
    const to = r.kind === "people" ? `/app/people/${r.id}` : `/app/place/${r.id}`;
    const Icon = r.kind === "people" ? GoPeople : GoGlobe;
    const assoc = associationsOf(r);
    return (
      <RegionCard key={`${r.kind}:${r.id}`}>
        <RegionTop>
          <RegionLink to={to}>
            <RegionIcon>
              <Icon size={16} />
            </RegionIcon>
            <span className="min-w-0">
              <RegionName>{r.name}</RegionName>
              <RegionKind>{r.kind === "people" ? "People" : "Place"}</RegionKind>
            </span>
          </RegionLink>
          <RemoveBtn type="button" title="Remove" onClick={() => removeRegion(r)}>
            <GoX size={14} />
          </RemoveBtn>
        </RegionTop>
        {assoc.length > 0 && (
          <Assoc>
            {assoc.map((a) => (
              <AssocLine key={a}>{a}</AssocLine>
            ))}
          </Assoc>
        )}
      </RegionCard>
    );
  }

  function removeRegion(region) {
    save({
      ...prefs,
      regions: regions.filter((r) => !(r.kind === region.kind && r.id === region.id)),
    });
  }

  return (
    <>
      <Header>Welcome back</Header>
      <Subtitle>{INTENT_COPY[intent] ?? "Your gateway to the histories you care about."}</Subtitle>

      <SectionHead>
        <SectionTitle>Your Interests</SectionTitle>
        <AddLink to="/welcome?step=regions">
          <GoPlus size={14} /> Add places/people
        </AddLink>
      </SectionHead>

      {regions.length === 0 ? (
        <EmptyState>
          <EmptyText>You haven’t chosen any regions yet.</EmptyText>
          <CtaBtn to="/welcome?step=regions">
            <GoPlus size={15} /> Pick your regions
          </CtaBtn>
        </EmptyState>
      ) : loadingGeo ? (
        <RegionGroups>
          <Spinner />
        </RegionGroups>
      ) : (
        <RegionGroups>
          {grouped.map((g) => (
            <div key={g.name ?? "_ungrouped"}>
              {g.name && <ContinentLabel>{g.name}</ContinentLabel>}
              <RegionGrid>{g.regions.map(renderRegion)}</RegionGrid>
            </div>
          ))}
        </RegionGroups>
      )}

      <SectionTitle className="mb-3">Suggestions</SectionTitle>
      <SuggestList>
        {suggestions.map((key) => {
          const { to, label, blurb, soon } = SUGGESTIONS[key];
          return (
            <SuggestItem key={key}>
              {soon ? (
                <SuggestNameStatic>
                  {label}
                  <SoonTag>Soon</SoonTag>
                </SuggestNameStatic>
              ) : (
                <SuggestName to={to}>{label}</SuggestName>
              )}
              <SuggestDesc>{blurb}</SuggestDesc>
            </SuggestItem>
          );
        })}
      </SuggestList>
    </>
  );
}
