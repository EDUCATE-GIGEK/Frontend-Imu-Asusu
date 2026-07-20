import { useParams, useNavigate, Link } from "react-router-dom";
import tw from "tailwind-styled-components";
import usePeoplePage from "@/hooks/usePeoplePage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import Spinner from "@/ui/Spinner";

// ── Styled components (match PlacePage / the app theme) ──────────────────────
const ParentLink = tw(Link)`inline-block text-sm text-title opacity-50 hover:opacity-100 transition-opacity mb-2`;
const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-1`;
const DesignationLabel = tw.span`block text-xs uppercase tracking-wide text-title opacity-50 mb-4`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;

const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;

const CardList = tw.div`flex flex-col gap-2.5`;
const Card = tw.div`flex items-start gap-3 rounded-xl border border-grey-info-outline bg-white px-4 py-3`;
const Tag = tw.span`shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 bg-orange-background-100 text-title mt-0.5`;
const CardTitle = tw.span`text-sm font-medium text-title`;
const EmptyNote = tw.p`text-sm text-title opacity-40`;

export default function PeoplePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, parent, children, places, languages, figures, entries, loadingPeople } =
    usePeoplePage(id);

  if (loadingPeople) return <Spinner />;
  if (!people) return <div>People not found.</div>;

  const description = people.general_info?.description ?? people.general_info?.note;

  return (
    <>
      {parent && (
        <ParentLink to={`/app/people/${parent.id}`}>← Part of {parent.name}</ParentLink>
      )}

      <HeroBlock>
        <StyledHeader>{people.name}</StyledHeader>
        <DesignationLabel>{people.designation?.label}</DesignationLabel>
        {description && <StyledDescription>{description}</StyledDescription>}
      </HeroBlock>

      <StatsRow>
        <StatItem>
          <StatNumber>{places.length}</StatNumber>
          <StatLabel>Homelands</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{languages.length}</StatNumber>
          <StatLabel>Languages</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{entries.length}</StatNumber>
          <StatLabel>History Entries</StatLabel>
        </StatItem>
      </StatsRow>

      {children.length > 0 && (
        <GroupedList label="Sub-groups">
          <Spacer>
            {children.map((c) => (
              <InfoOption
                key={c.id}
                label={c.name}
                onClick={() => navigate(`/app/people/${c.id}`)}
              />
            ))}
          </Spacer>
        </GroupedList>
      )}

      {places.length > 0 && (
        <GroupedList label="Homelands">
          <Spacer>
            {places.map((p) => (
              <InfoOption
                key={p.id}
                label={p.name}
                onClick={() => navigate(`/app/place/${p.id}`)}
              />
            ))}
          </Spacer>
        </GroupedList>
      )}

      {languages.length > 0 && (
        <GroupedList label="Language">
          <Spacer>
            <CardList>
              {languages.map((l) => (
                <Card key={l.id}>
                  {l.endangerment_status && (
                    <Tag>{l.endangerment_status.replace(/_/g, " ")}</Tag>
                  )}
                  <CardTitle>{l.name}</CardTitle>
                </Card>
              ))}
            </CardList>
          </Spacer>
        </GroupedList>
      )}

      {figures.length > 0 && (
        <GroupedList label="Notable figures">
          <Spacer>
            <CardList>
              {figures.map((f) => (
                <Card key={f.id}>
                  {f.role && <Tag>{f.role}</Tag>}
                  <CardTitle>{f.name}</CardTitle>
                </Card>
              ))}
            </CardList>
          </Spacer>
        </GroupedList>
      )}

      <GroupedList label="History">
        <Spacer>
          {entries.length === 0 ? (
            <EmptyNote>No published entries yet for this group.</EmptyNote>
          ) : (
            <CardList>
              {entries.map((e) => (
                <Card key={e.id}>
                  <Tag>{e.entry_type.replace(/_/g, " ")}</Tag>
                  <CardTitle>{e.title}</CardTitle>
                </Card>
              ))}
            </CardList>
          )}
        </Spacer>
      </GroupedList>
    </>
  );
}
