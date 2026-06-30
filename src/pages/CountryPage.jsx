import { useLocation, useNavigate } from "react-router-dom";
import useCountryPage from "@/hooks/useCountryPage";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`p-8`;
const HeroBlock = tw.div`hero-block`;
const StyledHeader = tw.h1`font-heading text-5xl font-bold text-title mb-4`;
const StyledDescription = tw.p`text-base text-title leading-relaxed max-w-2xl`;
const StatsRow = tw.div`flex items-center justify-center gap-0 mb-10 divide-x divide-grey-info-outline bg-orange-background-100 rounded-2xl px-8 py-6`;
const StatItem = tw.div`flex flex-col px-6 first:pl-0`;
const StatNumber = tw.span`font-heading text-4xl font-bold text-title`;
const StatLabel = tw.span`text-xs text-title opacity-50 mt-0.5 uppercase tracking-wide`;
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
      <HeroBlock>
        <StyledHeader>{name}</StyledHeader>
        <StyledDescription>{info?.countryDescription}</StyledDescription>
      </HeroBlock>

      <StatsRow>
        <StatItem>
          <StatNumber>{info?.statesCount}</StatNumber>
          <StatLabel>States</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.localGovernmentsCount}</StatNumber>
          <StatLabel>Local Governments</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.ethnicGroupsCount}</StatNumber>
          <StatLabel>Ethnic Groups</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{info?.endangeredGroupsCount}</StatNumber>
          <StatLabel>Endangered Groups</StatLabel>
        </StatItem>
      </StatsRow>

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
