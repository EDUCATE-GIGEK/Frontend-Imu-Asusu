import { useLocation, useNavigate } from "react-router-dom";
import { localGovernmentData } from "@/data/localGovernmentData";
import { ethnicGroupData } from "@/data/ethnicGroupData";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";

function LocalGovernmentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const lg = state ? localGovernmentData.find((l) => l.lg_id === state.lg_id) : null;

  if (!lg) return <div>No local government selected.</div>;

  const groups = ethnicGroupData.filter((eg) => eg.local_government_id === lg.lg_id);
  const { general_info: info } = lg;

  const goToGroup = (eg) =>
    navigate("/app/information", {
      state: { ethnic_group_id: eg.ethnic_group_id, lg_id: lg.lg_id, state_id: state.state_id, country: state.country, continent: state.continent },
    });

  return (
    <div>
      <GroupedList label={lg.name}>
        <p>{info.localGovernmentDescription}</p>
      </GroupedList>

      <GroupedList label="Overview">
        <Spacer>
          <InfoOption label={`${info.ethnicGroupsCount} Ethnic Groups`} />
          <InfoOption label={`${info.tribesCount} Tribes`} />
          <InfoOption label={`${info.endangeredGroupsCount} Endangered Groups`} />
          <InfoOption label={`${info.endangeredLanguagesCount} Endangered Languages`} />
        </Spacer>
      </GroupedList>

      <GroupedList label="Ethnic Groups">
        <Spacer>
          {groups.map((eg) => (
            <InfoOption key={eg.ethnic_group_id} label={eg.name} onClick={() => goToGroup(eg)} />
          ))}
        </Spacer>
      </GroupedList>
    </div>
  );
}

export default LocalGovernmentPage;
