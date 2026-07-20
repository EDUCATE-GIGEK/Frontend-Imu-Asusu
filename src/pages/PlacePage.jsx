import { useParams, useNavigate, Link } from "react-router-dom";
import tw from "tailwind-styled-components";
import usePlacePage from "@/hooks/usePlacePage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import Spinner from "@/ui/Spinner";

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

const EntryList = tw.div`flex flex-col gap-2.5`;
const EntryCard = tw.div`flex items-start gap-3 rounded-xl border border-grey-info-outline bg-white px-4 py-3`;
const EntryType = tw.span`shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 bg-orange-background-100 text-title mt-0.5`;
const EntryTitle = tw.span`text-sm font-medium text-title`;
const EmptyNote = tw.p`text-sm text-title opacity-40`;

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
          <StatLabel>Within</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{peoples.length}</StatNumber>
          <StatLabel>Peoples</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{entries.length}</StatNumber>
          <StatLabel>History Entries</StatLabel>
        </StatItem>
      </StatsRow>

      {children.length > 0 && (
        <GroupedList label="Within">
          <Spacer>
            {children.map((c) => (
              <InfoOption
                key={c.id}
                label={c.name}
                onClick={() => navigate(`/app/place/${c.id}`)}
              />
            ))}
          </Spacer>
        </GroupedList>
      )}

      {peoples.length > 0 && (
        <GroupedList label="Peoples">
          <Spacer>
            {peoples.map((p) => (
              <InfoOption
                key={p.id}
                label={p.name}
                onClick={() => navigate(`/app/people/${p.id}`)}
              />
            ))}
          </Spacer>
        </GroupedList>
      )}

      <GroupedList label="History">
        <Spacer>
          {entries.length === 0 ? (
            <EmptyNote>No published entries yet for this place.</EmptyNote>
          ) : (
            <EntryList>
              {entries.map((e) => (
                <EntryCard key={e.id}>
                  <EntryType>{e.entry_type.replace(/_/g, " ")}</EntryType>
                  <EntryTitle>{e.title}</EntryTitle>
                </EntryCard>
              ))}
            </EntryList>
          )}
        </Spacer>
      </GroupedList>
    </>
  );
}
