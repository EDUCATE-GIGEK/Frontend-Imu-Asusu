import { useLocation, useNavigate } from "react-router-dom";
import { ethnicGroupData } from "@/data/ethnicGroupData";
import { tribesData } from "@/data/tribesData";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";

function Information() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const eg = state
    ? ethnicGroupData.find((e) => e.ethnic_group_id === state.ethnic_group_id)
    : null;

  if (!eg) return <div>No ethnic group selected.</div>;

  const tribes =
    eg.general_info.tribesCount > 0
      ? tribesData.filter((t) => t.ethnic_group_id === eg.ethnic_group_id)
      : [];

  const { general_info: info } = eg;

  const goToTribe = (tribe) =>
    navigate("/app/tribe", {
      state: { tribe_id: tribe.tribe_id, ethnic_group_id: eg.ethnic_group_id, country: state.country, continent: state.continent },
    });

  return (
    <div>
      <GroupedList label={eg.name}>
        <p>{info.ethnicGroupDescription}</p>
        {info.isEndangered && <p>Endangered</p>}
      </GroupedList>

      <GroupedList label="Overview">
        <Spacer>
          <InfoOption label={`${info.spokenLanguagesCount} Spoken Languages`} />
          <InfoOption label={`${info.writtenLanguagesCount} Written Languages`} />
          {info.tribesCount > 0 && <InfoOption label={`${info.tribesCount} Tribes`} />}
        </Spacer>
      </GroupedList>

      <GroupedList label="Languages">
        <Spacer>
          {eg.languages.map((lang) => (
            <InfoOption key={lang} label={lang} />
          ))}
        </Spacer>
      </GroupedList>

      {tribes.length > 0 && (
        <GroupedList label="Tribes">
          <Spacer>
            {tribes.map((tribe) => (
              <InfoOption key={tribe.tribe_id} label={tribe.name} onClick={() => goToTribe(tribe)} />
            ))}
          </Spacer>
        </GroupedList>
      )}
    </div>
  );
}

export default Information;
