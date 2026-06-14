import { useLocation, useNavigate } from "react-router-dom";
import { countriesData } from "@/data/countriesData";
import { statesData } from "@/data/statesData";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";

const StyledHeader = tw.h1`
  text-4xl
  font-bold
  mb-4
  text-title
`;

const StyledDescription = tw.p`
  bg-orange-background-100
  rounded-md
  px-6
  py-4
  h-1/5
  mb-6
  italic
`;

const InfoList = tw.ul`
  list-disc
  pl-6
  mb-6
`;

function CountryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const country = state
    ? countriesData.find(
        (c) => c.name === state.country && c.continent_id === state.continent,
      )
    : null;

  if (!country) return <div>Select a country from the sidebar.</div>;

  const states = statesData.filter((s) => s.country_id === country.country_id);
  const { general_info: info, name } = country;

  const goToState = (st) =>
    navigate("/app/state", {
      state: {
        state_id: st.state_id,
        country: country.name,
        continent: state.continent,
      },
    });

  return (
    <>
      <StyledHeader>{name}</StyledHeader>
      <StyledDescription>{info.countryDescription}</StyledDescription>

      <InfoList>
        <li>{`${info.statesCount} States`} </li>
        <li>{`${info.localGovernmentsCount} Local Governments`} </li>
        <li>{`${info.ethnicGroupsCount} Ethnic Groups`} </li>
        <li>{`${info.endangeredGroupsCount} Endangered Groups`} </li>
      </InfoList>

      <GroupedList label="States">
        <Spacer>
          {states.map((st) => (
            <InfoOption
              key={st.state_id}
              label={st.name}
              onClick={() => goToState(st)}
            />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default CountryPage;
