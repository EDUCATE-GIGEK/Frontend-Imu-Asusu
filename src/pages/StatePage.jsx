import { useLocation, useNavigate } from "react-router-dom";
import { statesData } from "@/data/statesData";
import { localGovernmentData } from "@/data/localGovernmentData";
import { ethnicGroupData } from "@/data/ethnicGroupData";
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

  const stateObj = state ? statesData.find((s) => s.state_id === state.state_id) : null;

  if (!stateObj) return <div>No state selected.</div>;

  const lgs = localGovernmentData.filter((lg) => lg.state_id === stateObj.state_id);
  const groups = ethnicGroupData.filter((eg) => eg.state_id === stateObj.state_id);
  const { general_info: info } = stateObj;

  const goToLG = (lg) =>
    navigate("/app/local-government", {
      state: { lg_id: lg.lg_id, state_id: stateObj.state_id, country: state.country, continent: state.continent },
    });

  const goToGroup = (eg) =>
    navigate("/app/information", {
      state: { ethnic_group_id: eg.ethnic_group_id, state_id: stateObj.state_id, country: state.country, continent: state.continent },
    });

  return (
    <>
      <StyledHeader>{stateObj.name}</StyledHeader>
      <StyledDescription>{info.stateDescription}</StyledDescription>

      <InfoList>
        <li>{`${info.localGovernmentsCount} Local Governments`}</li>
        <li>{`${info.ethnicGroupsCount} Ethnic Groups`}</li>
        <li>{`${info.endangeredGroupsCount} Endangered Groups`}</li>
        <li>{`${info.endangeredLanguagesCount} Endangered Languages`}</li>
      </InfoList>

      <GroupedList label="Local Governments">
        <Spacer>
          {lgs.map((lg) => (
            <InfoOption key={lg.lg_id} label={lg.name} onClick={() => goToLG(lg)} />
          ))}
        </Spacer>
      </GroupedList>

      <GroupedList label="Ethnic Groups">
        <Spacer>
          {groups.map((eg) => (
            <InfoOption key={eg.ethnic_group_id} label={eg.name} onClick={() => goToGroup(eg)} />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default StatePage;
