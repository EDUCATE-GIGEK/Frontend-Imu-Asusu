import { useParams, useNavigate, Link } from "react-router-dom";
import tw from "tailwind-styled-components";
import usePlacePage from "@/hooks/usePlacePage";
import Spinner from "@/ui/Spinner";
import HistorySection from "@/features/Explore/HistorySection";
import FacetedNavList from "@/features/Explore/FacetedNavList";

// ── Styled components (match the app theme) ─────────────────────────────────
const ParentLink = tw(Link)`inline-block text-sm text-title opacity-50 hover:opacity-100 transition-opacity mb-2`;
const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-1`;
const DesignationLabel = tw.span`block text-xs uppercase tracking-wide text-title opacity-50 mb-4`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;

const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;

export default function PlacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { place, parent, children, peoples, entries, loadingPlace } = usePlacePage(id);

  if (loadingPlace) return <Spinner />;
  if (!place) return <div>Place not found.</div>;

  const description = place.general_info?.description;

  return (
    <>
      {parent && (
        <ParentLink to={`/app/place/${parent.id}`}>← Part of {parent.name}</ParentLink>
      )}

      <HeroBlock>
        <StyledHeader>{place.name}</StyledHeader>
        <DesignationLabel>{place.designation?.label}</DesignationLabel>
        {description && <StyledDescription>{description}</StyledDescription>}
      </HeroBlock>

      <StatsRow>
        <StatItem>
          <StatNumber>{children.length}</StatNumber>
          <StatLabel>Places</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{peoples.length}</StatNumber>
          <StatLabel>People</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{entries.length}</StatNumber>
          <StatLabel>History Entries</StatLabel>
        </StatItem>
      </StatsRow>

      <FacetedNavList
        label="Places"
        items={children}
        categoryOf={(c) => c.designation?.label}
        to={(c) => navigate(`/app/place/${c.id}`)}
      />

      <FacetedNavList
        label="People"
        items={peoples}
        categoryOf={(p) => p.designation?.label}
        to={(p) => navigate(`/app/people/${p.id}`)}
      />

      <HistorySection entries={entries} nodeId={id} nodeKind="place" />
    </>
  );
}
