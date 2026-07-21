import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import tw from "tailwind-styled-components";
import { GoPlus, GoSearch, GoX } from "react-icons/go";
import usePreferences from "@/hooks/usePreferences";
import { getAllPlaces } from "@/services/apiPlaces";
import { getAllPeoples } from "@/services/apiPeoples";
import PlaceCard from "@/features/Explore/PlaceCard";
import PeopleCard from "@/features/Explore/PeopleCard";
import Spinner from "@/ui/Spinner";

// ── Styling ─────────────────────────────────────────────────────────────────
const Header = tw.h1`font-heading text-4xl font-bold text-title mb-1`;
const Subtitle = tw.p`text-base text-title opacity-70 mb-10 font-heading italic`;

const SectionWrap = tw.section`mb-12`;
const SectionHead = tw.div`flex items-baseline gap-2 mb-3`;
const SectionTitle = tw.h2`text-2xl font-bold text-title`;
const Count = tw.span`text-sm text-title opacity-40`;
const CardGrid = tw.div`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`;
const EmptyNote = tw.p`text-sm text-title opacity-40`;

const SearchBox = tw.div`
  flex items-center gap-2 rounded-xl border border-grey-info-outline bg-white px-3 py-2 mb-10 max-w-md
  focus-within:border-orange-accent transition-colors
`;
const SearchInput = tw.input`
  flex-1 bg-transparent border-none outline-none text-sm text-title placeholder:opacity-40 font-body
`;
const ClearBtn = tw.button`
  flex items-center justify-center w-5 h-5 rounded-full bg-transparent border-none cursor-pointer
  text-title opacity-60 hover:opacity-100 hover:bg-black/10 transition-all
`;

const EmptyState = tw.div`rounded-xl border border-dashed border-grey-info-outline px-6 py-8 text-center`;
const EmptyText = tw.p`text-sm text-title opacity-60 mb-4 font-body not-italic`;
const CtaBtn = tw(Link)`
  inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold no-underline
  bg-orange-accent text-title hover:brightness-95 transition-all
`;

export default function Explore() {
  const { prefs } = usePreferences();
  const regions = prefs.regions ?? [];

  const { data: places = [], isLoading: lp } = useQuery({ queryKey: ["all-places"], queryFn: getAllPlaces });
  const { data: peoples = [], isLoading: lpe } = useQuery({ queryKey: ["all-peoples"], queryFn: getAllPeoples });

  const placesById = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);
  const peoplesById = useMemo(() => new Map(peoples.map((p) => [p.id, p])), [peoples]);

  // The user's own selections, enriched to full rows (for the level label) where
  // available, falling back to the stored { id, name }.
  const selectedPlaces = regions
    .filter((r) => r.kind === "place")
    .map((r) => placesById.get(r.id) ?? { id: r.id, name: r.name });
  const selectedPeoples = regions
    .filter((r) => r.kind === "people")
    .map((r) => peoplesById.get(r.id) ?? { id: r.id, name: r.name });

  if (lp || lpe) return <Spinner />;

  return (
    <>
      <Header>My Regions</Header>
      <Subtitle>The places and people you're following.</Subtitle>

      {regions.length === 0 ? (
        <EmptyState>
          <EmptyText>You haven’t chosen any regions yet.</EmptyText>
          <CtaBtn to="/welcome">
            <GoPlus size={15} /> Pick your regions
          </CtaBtn>
        </EmptyState>
      ) : (
        <>
          <SectionWrap>
            <SectionHead>
              <SectionTitle>Places</SectionTitle>
              <Count>{selectedPlaces.length}</Count>
            </SectionHead>
            {selectedPlaces.length === 0 ? (
              <EmptyNote>No places selected yet.</EmptyNote>
            ) : (
              <CardGrid>
                {selectedPlaces.map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
              </CardGrid>
            )}
          </SectionWrap>

          <SectionWrap>
            <SectionHead>
              <SectionTitle>People</SectionTitle>
              <Count>{selectedPeoples.length}</Count>
            </SectionHead>
            {selectedPeoples.length === 0 ? (
              <EmptyNote>No people selected yet.</EmptyNote>
            ) : (
              <CardGrid>
                {selectedPeoples.map((p) => (
                  <PeopleCard key={p.id} people={p} />
                ))}
              </CardGrid>
            )}
          </SectionWrap>
        </>
      )}
    </>
  );
}
