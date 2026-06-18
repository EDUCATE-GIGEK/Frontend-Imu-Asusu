import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCountryByName } from "@/services/apiCountries";
import { getStatesByCountry } from "@/services/apiStates";
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

const SELECTABLE = new Set(["Lagos"]);

function CountryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const countryName = state?.country ?? null;

  const { data: country, isLoading: loadingCountry } = useQuery({
    queryKey: ["country", countryName],
    queryFn: () => getCountryByName(countryName),
    enabled: !!countryName,
  });

  const { data: states = [], isLoading: loadingStates } = useQuery({
    queryKey: ["states", "country", country?.id],
    queryFn: () => getStatesByCountry(country.id),
    enabled: !!country?.id,
  });

  if (!countryName) return <div>Select a country from the sidebar.</div>;
  if (loadingCountry || loadingStates) return <div>Loading…</div>;
  if (!country) return <div>Country not found.</div>;

  const { general_info: info, country_name: name } = country;

  const goToState = (st) =>
    navigate("/app/state", {
      state: { stateId: st.id, countryId: country.id },
    });

  return (
    <>
      <StyledHeader>{name}</StyledHeader>
      <StyledDescription>{info?.countryDescription}</StyledDescription>

      <InfoList>
        <li>{`${info?.statesCount} States`}</li>
        <li>{`${info?.localGovernmentsCount} Local Governments`}</li>
        <li>{`${info?.ethnicGroupsCount} Ethnic Groups`}</li>
        <li>{`${info?.endangeredGroupsCount} Endangered Groups`}</li>
      </InfoList>

      <GroupedList label="States">
        <Spacer>
          {states.map((st) => (
            <InfoOption
              key={st.id}
              label={st.state_name}
              onClick={() => goToState(st)}
              disabled={!SELECTABLE.has(st.state_name)}
            />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default CountryPage;
