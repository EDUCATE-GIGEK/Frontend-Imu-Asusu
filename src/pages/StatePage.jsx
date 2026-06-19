import { useLocation, useNavigate } from "react-router-dom";
import useStatePage from "@/hooks/useStatePage";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import tw from "tailwind-styled-components";
import Spinner from "@/ui/Spinner";

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
            <InfoOption
              key={lg.id}
              label={lg.name}
              onClick={() => goToLG(lg)}
            />
          ))}
        </Spacer>
      </GroupedList>

      <GroupedList label="Ethnic Groups">
        <Spacer>
          {egs.map((eg) => (
            <InfoOption
              key={eg.id}
              label={eg.name}
              onClick={() => goToGroup(eg)}
            />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default StatePage;
