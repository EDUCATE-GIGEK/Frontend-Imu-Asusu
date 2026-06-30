import { useLocation, useNavigate } from "react-router-dom";
import useStatePage from "@/hooks/useStatePage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import tw from "tailwind-styled-components";
import Spinner from "@/ui/Spinner";

const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-4`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;
const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;

function StatePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const stateId = state?.stateId ?? null;

  const { stateObj, loadingState, lgs, loadingLGs, egs, loadingEGs } =
    useStatePage(stateId);

  if (!stateId) return <div>No state selected.</div>;
  if (loadingState || loadingLGs || loadingEGs) return <Spinner />;
  if (!stateObj) return <div>State not found.</div>;

  const { general_info: info, state_name } = stateObj;

  const goToLG = (lg) =>
    navigate("/app/local-government", {
      state: { lgId: lg.id, stateId: stateObj.id },
    });

  const goToGroup = (eg) =>
    navigate("/app/ethnic-group", {
      state: { ethnicGroupId: eg.id, stateId: stateObj.id },
    });

  return (
    <>
      <HeroBlock>
        <StyledHeader>{state_name}</StyledHeader>
        <StyledDescription>{info?.stateDescription}</StyledDescription>
      </HeroBlock>

      <StatsRow>
        <StatItem>
          <StatNumber>{info?.localGovernmentsCount}</StatNumber>
          <StatLabel>Local Governments</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.ethnicGroupsCount}</StatNumber>
          <StatLabel>Ethnic Groups</StatLabel>
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

      <GroupedList label="Local Governments">
        <Spacer>
          {lgs.map((lg) => (
            <InfoOption key={lg.id} label={lg.name} onClick={() => goToLG(lg)} />
          ))}
        </Spacer>
      </GroupedList>

      <GroupedList label="Ethnic Groups">
        <Spacer>
          {egs.map((eg) => (
            <InfoOption key={eg.id} label={eg.name} onClick={() => goToGroup(eg)} />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default StatePage;
