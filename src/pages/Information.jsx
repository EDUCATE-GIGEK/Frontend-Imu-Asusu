import { useLocation } from "react-router-dom";
import { groupsData } from "@/data/groupsData";
import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";

function Information() {
  const { state } = useLocation();
  const info = state ? groupsData[state.country]?.[state.group] : null;

  if (!info) {
    return <div>No group selected.</div>;
  }

  return (
    <div>
      <GroupedList label={state.group}>
        <p>{info.description}</p>
        <p>{info.location}</p>
      </GroupedList>

      <GroupedList label="Religions">
        <Spacer>
          {info.religions.map((r) => (
            <InfoOption key={r} label={r} />
          ))}
        </Spacer>
      </GroupedList>

      <GroupedList label="Cultures">
        <Spacer>
          {info.cultures.map((c) => (
            <InfoOption key={c} label={c} />
          ))}
        </Spacer>
      </GroupedList>
    </div>
  );
}

export default Information;
