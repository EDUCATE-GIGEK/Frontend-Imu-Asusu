import { useLocation, useNavigate } from "react-router-dom";
import useCountryPage from "@/hooks/useCountryPage";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`p-8`;
const StyledHeader = tw.h1`text-4xl font-bold mb-4 text-title`;
const StyledDescription = tw.p`
  bg-orange-background-100
  rounded-md
  px-6
  py-4
  mb-6
  italic
`;
const InfoList = tw.ul`list-disc pl-6 mb-8`;
const SectionLabel = tw.p`text-xs font-semibold text-title opacity-40 uppercase tracking-widest mb-4`;

const Grid = tw.div`grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 max-w-3xl`;
const StateBtn = tw.button`
  border-2 rounded-xl py-6 px-4 text-center transition-all duration-150
  ${(p) =>
    p.$disabled
      ? "opacity-40 cursor-not-allowed bg-white border-grey-info-outline"
      : "cursor-pointer bg-white border-grey-info-outline shadow-sm hover:border-orange-300"}
`;
const StateName = tw.div`text-sm text-title font-medium`;
const ComingSoon = tw.span`block text-[10px] text-title opacity-40 mt-1`;

const SELECTABLE = new Set(["Lagos"]);

function CountryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const countryName = state?.country ?? "Nigeria";

  const { country, loadingCountry, states, loadingStates } = useCountryPage(countryName);

  if (loadingCountry || loadingStates) return <PageWrapper><p>Loading…</p></PageWrapper>;
  if (!country) return <PageWrapper><p>Country not found.</p></PageWrapper>;

  const { general_info: info, country_name: name } = country;

  const goToState = (st) =>
    navigate("/app/state", {
      state: { stateId: st.id, countryId: country.id },
    });

  return (
    <PageWrapper>
      <StyledHeader>{name}</StyledHeader>
      <StyledDescription>{info?.countryDescription}</StyledDescription>

      <InfoList>
        <li>{`${info?.statesCount} States`}</li>
        <li>{`${info?.localGovernmentsCount} Local Governments`}</li>
        <li>{`${info?.ethnicGroupsCount} Ethnic Groups`}</li>
        <li>{`${info?.endangeredGroupsCount} Endangered Groups`}</li>
      </InfoList>

      <SectionLabel>Select a state</SectionLabel>
      <Grid>
        {states.map((st) => {
          const selectable = SELECTABLE.has(st.state_name);
          return (
            <StateBtn
              key={st.id}
              onClick={() => selectable && goToState(st)}
              $disabled={!selectable}
            >
              <StateName>{st.state_name}</StateName>
              {!selectable && <ComingSoon>Coming soon</ComingSoon>}
            </StateBtn>
          );
        })}
      </Grid>
    </PageWrapper>
  );
}

export default CountryPage;
