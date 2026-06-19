import { useLocation, useNavigate } from "react-router-dom";
import useLocalGovernmentPage from "@/hooks/useLocalGovernmentPage";
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
      <StyledHeader>{lg.name}</StyledHeader>
      <StyledDescription>{info?.localGovernmentDescription}</StyledDescription>

      <InfoList>
        <li>{`${info?.ethnicGroupsCount} Ethnic Groups`}</li>
        <li>{`${info?.tribesCount} Tribes`}</li>
        <li>{`${info?.endangeredGroupsCount} Endangered Groups`}</li>
        <li>{`${info?.endangeredLanguagesCount} Endangered Languages`}</li>
      </InfoList>

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
