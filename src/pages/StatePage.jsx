import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getState } from "@/services/apiStates";
import { getLGsByState } from "@/services/apiLocalGovernments";
import { getEthnicGroupsByState } from "@/services/apiEthnicGroups";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import tw from "tailwind-styled-components";

const StyledHeader = tw.h1`text-4xl font-bold mb-4 text-title`;
const StyledDescription = tw.p`
  bg-orange-background-100
  rounded-md
  px-6
  py-4
  h-1/5
  mb-6
  italic
`;
const InfoList = tw.ul`list-disc pl-6 mb-6`;

function StatePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const stateId = state?.stateId ?? null;

  const { data: stateObj, isLoading: loadingState } = useQuery({
    queryKey: ["state", stateId],
    queryFn: () => getState(stateId),
    enabled: !!stateId,
  });

  const { data: lgs = [], isLoading: loadingLGs } = useQuery({
    queryKey: ["lgs", stateId],
    queryFn: () => getLGsByState(stateId),
    enabled: !!stateId,
  });

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["ethnicGroups", "state", stateId],
    queryFn: () => getEthnicGroupsByState(stateId),
    enabled: !!stateId,
  });

  if (!stateId) return <div>No state selected.</div>;
  if (loadingState || loadingLGs || loadingGroups) return <div>Loading…</div>;
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
      <StyledHeader>{state_name}</StyledHeader>
      <StyledDescription>{info?.stateDescription}</StyledDescription>

      <InfoList>
        <li>{`${info?.localGovernmentsCount} Local Governments`}</li>
        <li>{`${info?.ethnicGroupsCount} Ethnic Groups`}</li>
        <li>{`${info?.endangeredGroupsCount} Endangered Groups`}</li>
        <li>{`${info?.endangeredLanguagesCount} Endangered Languages`}</li>
      </InfoList>

      <GroupedList label="Local Governments">
        <Spacer>
          {lgs.map((lg) => (
            <InfoOption key={lg.id} label={lg.name} onClick={() => goToLG(lg)} />
          ))}
        </Spacer>
      </GroupedList>

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

export default StatePage;
