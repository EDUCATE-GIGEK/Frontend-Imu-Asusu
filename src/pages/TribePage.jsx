import { useLocation } from "react-router-dom";
import useTribePage from "@/hooks/useTribePage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import tw from "tailwind-styled-components";

const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-1`;
const EndangeredBadge = tw.span`text-sm font-semibold text-red-600 mb-4 block`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;
const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;

function TribePage() {
  const { state } = useLocation();

  const tribeId = state?.tribeId ?? null;

  const { tribe, loadingTribe } = useTribePage(tribeId);

  if (!tribeId) return <div>No tribe selected.</div>;
  if (loadingTribe) return <div>Loading…</div>;
  if (!tribe) return <div>Tribe not found.</div>;

  const { general_info: info } = tribe;

  return (
    <>
      <HeroBlock>
        <StyledHeader>{tribe.name}</StyledHeader>
        {info?.isEndangered && <EndangeredBadge>Endangered</EndangeredBadge>}
        <StyledDescription>{info?.tribeDescription}</StyledDescription>
      </HeroBlock>

      <StatsRow>
        <StatItem>
          <StatNumber>{info?.spokenLanguagesCount}</StatNumber>
          <StatLabel>Spoken Languages</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.writtenLanguagesCount}</StatNumber>
          <StatLabel>Written Languages</StatLabel>
        </StatItem>
      </StatsRow>

      <GroupedList label="Languages">
        <Spacer>
          {(tribe.languages ?? []).map((lang) => (
            <InfoOption key={lang} label={lang} />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default TribePage;
