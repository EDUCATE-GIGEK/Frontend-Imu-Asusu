import { useLocation, useNavigate } from "react-router-dom";
import { countriesData } from "@/data/countriesData";
import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";

function Places() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const country = state
    ? countriesData[state.continent]?.find((c) => c.name === state.country)
    : null;

  if (!country) {
    return <div>Select a country from the sidebar.</div>;
  }

  const goToGroup = (group) =>
    navigate("/app/information", {
      state: { group, country: state.country, continent: state.continent },
    });

  return (
    <div>
      <GroupedList label={country.name}>
        <p>{country.states} states / provinces</p>
        <p>Ethnic Groups: {country.ethnicGroupCount}</p>
      </GroupedList>

      <GroupedList label="Ethnic Groups">
        <Spacer>
          {country.ethnicGroups.map((group) => (
            <InfoOption key={group} label={group} onClick={() => goToGroup(group)} />
          ))}
        </Spacer>
      </GroupedList>

      <GroupedList label="Endangered Groups">
        <Spacer>
          {country.endangeredGroups.map((group) => (
            <InfoOption key={group} label={group} onClick={() => goToGroup(group)} />
          ))}
        </Spacer>
      </GroupedList>
    </div>
  );
}

export default Places;
