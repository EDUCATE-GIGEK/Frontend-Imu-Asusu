import { useLocation, useNavigate } from "react-router-dom";
import useEthnicGroupPage from "@/hooks/useEthnicGroupPage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import HistoryCard from "@/features/EthnicGroupPage/HistoryCard";
import tw from "tailwind-styled-components";

const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-1`;
const EndangeredBadge = tw.span`text-sm font-semibold text-red-600 mb-4 block`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;
const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;

function EthnicGroupPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const ethnicGroupId = state?.ethnicGroupId ?? null;

  const { eg, loadingEG, tribes, loadingTribes, history, loadingHistory } =
    useEthnicGroupPage(ethnicGroupId);

  if (!ethnicGroupId) return <div>No ethnic group selected.</div>;
  if (loadingEG || loadingTribes || loadingHistory) return <div>Loading…</div>;
  if (!eg) return <div>Ethnic group not found.</div>;

  const { general_info: info } = eg;

  const goToTribe = (tribe) =>
    navigate("/app/tribe", {
      state: { tribeId: tribe.id, ethnicGroupId: eg.id },
    });

  return (
    <>
      <HeroBlock>
        <StyledHeader>{eg.name}</StyledHeader>
        {info?.isEndangered && <EndangeredBadge>Endangered</EndangeredBadge>}
        <StyledDescription>{info?.ethnicGroupDescription}</StyledDescription>
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
        {info?.tribesCount > 0 && (
          <StatItem>
            <StatNumber>{info.tribesCount}</StatNumber>
            <StatLabel>Tribes</StatLabel>
          </StatItem>
        )}
      </StatsRow>

      <GroupedList label="Languages">
        <Spacer>
          {(eg.languages ?? []).map((lang) => (
            <InfoOption key={lang} label={lang} />
          ))}
        </Spacer>
      </GroupedList>

      {tribes.length > 0 && (
        <GroupedList label="Tribes">
          <Spacer>
            {tribes.map((tribe) => (
              <InfoOption key={tribe.id} label={tribe.name} onClick={() => goToTribe(tribe)} />
            ))}
          </Spacer>
        </GroupedList>
      )}

      {history.length > 0 && (
        <GroupedList label="History">
          <div className="mt-2">
            {history.map((h) => (
              <HistoryCard key={h.id} h={h} />
            ))}
          </div>
        </GroupedList>
      )}
    </>
  );
}

export default EthnicGroupPage;
