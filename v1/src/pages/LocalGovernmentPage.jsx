import { useLocation, useNavigate } from "react-router-dom";
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

function LocalGovernmentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const lg = state ? localGovernmentData.find((l) => l.lg_id === state.lg_id) : null;

  if (!lg) return <div>No local government selected.</div>;

  const groups = ethnicGroupData.filter((eg) => eg.local_government_id === lg.lg_id);
  const { general_info: info } = lg;

  const goToGroup = (eg) =>
    navigate("/app/ethnic-group", {
      state: { ethnic_group_id: eg.ethnic_group_id, lg_id: lg.lg_id, state_id: state.state_id, country: state.country, continent: state.continent },
    });

  return (
    <>
      <StyledHeader>{lg.name}</StyledHeader>
      <StyledDescription>{info.localGovernmentDescription}</StyledDescription>

      <InfoList>
        <li>{`${info.ethnicGroupsCount} Ethnic Groups`}</li>
        <li>{`${info.tribesCount} Tribes`}</li>
        <li>{`${info.endangeredGroupsCount} Endangered Groups`}</li>
        <li>{`${info.endangeredLanguagesCount} Endangered Languages`}</li>
      </InfoList>

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

export default LocalGovernmentPage;
