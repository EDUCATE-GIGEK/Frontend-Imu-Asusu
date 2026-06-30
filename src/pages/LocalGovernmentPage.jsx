import { useLocation, useNavigate } from "react-router-dom";
import useLocalGovernmentPage from "@/hooks/useLocalGovernmentPage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import tw from "tailwind-styled-components";

const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-4`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;
const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;

function LocalGovernmentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const lgId = state?.lgId ?? null;

  const { lg, loadingLG, groups, loadingGroups } = useLocalGovernmentPage(lgId);

  if (!lgId) return <div>No local government selected.</div>;
  if (loadingLG || loadingGroups) return <div>Loading…</div>;
  if (!lg) return <div>Local government not found.</div>;

  const { general_info: info } = lg;

  const goToGroup = (eg) =>
    navigate("/app/ethnic-group", {
      state: { ethnicGroupId: eg.id, lgId: lg.id, stateId: state.stateId },
    });

  return (
    <>
      <HeroBlock>
        <StyledHeader>{lg.name}</StyledHeader>
        <StyledDescription>{info?.localGovernmentDescription}</StyledDescription>
      </HeroBlock>

      <StatsRow>
        <StatItem>
          <StatNumber>{info?.ethnicGroupsCount}</StatNumber>
          <StatLabel>Ethnic Groups</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.tribesCount}</StatNumber>
          <StatLabel>Tribes</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.endangeredGroupsCount}</StatNumber>
          <StatLabel>Endangered Groups</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.endangeredLanguagesCount}</StatNumber>
          <StatLabel>Endangered Languages</StatLabel>
        </StatItem>
      </StatsRow>

      <GroupedList label="Ethnic Groups">
        <Spacer>
          {groups.map((eg) => (
            <InfoOption key={eg.id} label={eg.name} onClick={() => goToGroup(eg)} />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default LocalGovernmentPage;
