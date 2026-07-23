import { Link } from "react-router-dom";
import tw from "tailwind-styled-components";
import { GoPencil, GoMilestone, GoBook, GoPlus, GoX, GoGlobe, GoPeople } from "react-icons/go";
import usePreferences from "@/hooks/usePreferences";

// Intent → hero subtitle + the order workspace tiles appear in.
const INTENT_COPY = {
  teach: "Build teaching materials from the histories you care about.",
  research: "Trace connections across sources, peoples and places.",
  explore: "Wander the histories that spark your curiosity.",
};

const WORKSPACES = {
  manuscripts: { to: "/app/my-manuscripts", label: "Manuscripts", blurb: "Draft & edit teaching manuscripts", Icon: GoPencil },
  timeline: { to: "/app/my-timeline", label: "Timeline", blurb: "See histories on a timeline", Icon: GoMilestone },
  learning: { to: "/app/my-learning", label: "Learning", blurb: "Study and take notes", Icon: GoBook },
};

const TILE_ORDER = {
  teach: ["manuscripts", "timeline", "learning"],
  research: ["timeline", "manuscripts", "learning"],
  explore: ["learning", "timeline", "manuscripts"],
};
const DEFAULT_ORDER = ["manuscripts", "timeline", "learning"];

// ── Styled components ───────────────────────────────────────────────────────
const Header = tw.h1`font-heading text-4xl font-bold text-title mb-1`;
const Subtitle = tw.p`text-base text-title opacity-70 mb-10 font-heading italic`;

const SectionHead = tw.div`flex items-center justify-between mb-3`;
const SectionTitle = tw.h2`text-2xl font-bold text-title`;
const AddLink = tw(Link)`
  inline-flex items-center gap-1 text-sm font-medium text-title opacity-60
  hover:opacity-100 transition-opacity no-underline
`;

const RegionGrid = tw.div`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12`;
const RegionCard = tw.div`
  group relative flex items-center gap-3 rounded-xl border border-grey-info-outline bg-white
  pl-4 pr-3 py-3 hover:border-orange-accent hover:bg-orange-background-100 transition-colors
`;
const RegionLink = tw(Link)`flex flex-1 items-center gap-3 no-underline min-w-0`;
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

// Three columns only when there is real room (the 24rem sidebar + content
// padding eat a lot of width); two columns below that so tile headings never
// clip. min-w-0 lets tracks shrink instead of overflowing.
const TileGrid = tw.div`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`;
const Tile = tw(Link)`
  flex flex-col gap-2 rounded-2xl border border-grey-info-outline bg-white p-5 no-underline min-w-0
  hover:border-orange-accent hover:bg-orange-background-100 transition-colors
`;
const TileIcon = tw.span`flex items-center justify-center w-10 h-10 rounded-xl bg-orange-background-100 text-title`;
const TileLabel = tw.span`font-heading text-base font-bold text-title`;
const TileBlurb = tw.span`text-xs text-title opacity-50 font-body`;

export default function Home() {
  const { prefs, save } = usePreferences();
  const { regions, intent } = prefs;

  const order = TILE_ORDER[intent] ?? DEFAULT_ORDER;

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
        <SectionTitle>Your regions</SectionTitle>
        <AddLink to="/welcome">
          <GoPlus size={14} /> Add regions
        </AddLink>
      </SectionHead>

      {regions.length === 0 ? (
        <EmptyState>
          <EmptyText>You haven’t chosen any regions yet.</EmptyText>
          <CtaBtn to="/welcome">
            <GoPlus size={15} /> Pick your regions
          </CtaBtn>
        </EmptyState>
      ) : (
        <RegionGrid>
          {regions.map((r) => {
            const to = r.kind === "people" ? `/app/people/${r.id}` : `/app/place/${r.id}`;
            const Icon = r.kind === "people" ? GoPeople : GoGlobe;
            return (
              <RegionCard key={`${r.kind}:${r.id}`}>
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
              </RegionCard>
            );
          })}
        </RegionGrid>
      )}

      <SectionTitle className="mb-3">Workspaces</SectionTitle>
      <TileGrid>
        {order.map((key) => {
          const { to, label, blurb, Icon } = WORKSPACES[key];
          return (
            <Tile key={key} to={to}>
              <TileIcon>
                <Icon size={18} />
              </TileIcon>
              <TileLabel>{label}</TileLabel>
              <TileBlurb>{blurb}</TileBlurb>
            </Tile>
          );
        })}
      </TileGrid>
    </>
  );
}
