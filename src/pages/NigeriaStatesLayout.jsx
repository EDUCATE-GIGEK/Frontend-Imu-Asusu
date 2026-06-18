import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCountryByName } from "@/services/apiCountries";
import { getStatesByCountry } from "@/services/apiStates";
import tw from "tailwind-styled-components";

const PageWrapper = tw.div`min-h-screen bg-orange-background-100 p-8 font-sans`;
const PageTitle = tw.h1`text-title mb-1 text-3xl font-bold`;
const Subtitle = tw.p`text-title opacity-60 mb-8`;
const Grid = tw.div`grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-w-3xl`;
const StateBtn = tw.button`
  border-2 rounded-xl py-6 px-4 text-center transition-all duration-150
  ${(p) => p.$disabled
    ? "opacity-40 cursor-not-allowed bg-white border-grey-info-outline"
    : "cursor-pointer bg-white border-grey-info-outline shadow-sm hover:border-orange-300"}
`;
const StateName = tw.div`text-sm text-title mt-1 font-medium`;
const ComingSoon = tw.span`block text-[10px] text-title opacity-40 mt-1`;

const SELECTABLE = new Set(["Lagos"]);

export default function NigeriaStatesLayout() {
  const navigate = useNavigate();

  const { data: country } = useQuery({
    queryKey: ["country", "Nigeria"],
    queryFn: () => getCountryByName("Nigeria"),
  });

  const { data: states = [], isLoading } = useQuery({
    queryKey: ["states", "country", country?.id],
    queryFn: () => getStatesByCountry(country.id),
    enabled: !!country?.id,
  });

  const goToState = (stateObj) => {
    navigate("/app/state", {
      state: { stateId: stateObj.id, countryId: stateObj.country_id },
    });
  };

  if (isLoading) return <PageWrapper><p>Loading states…</p></PageWrapper>;

  return (
    <PageWrapper>
      <PageTitle>Explore Nigeria</PageTitle>
      <Subtitle>Select a state to begin exploring its local governments, ethnic groups, and more.</Subtitle>

      <Grid>
        {states.map((stateObj) => {
          const selectable = SELECTABLE.has(stateObj.state_name);
          return (
            <StateBtn
              key={stateObj.id}
              onClick={() => selectable && goToState(stateObj)}
              $disabled={!selectable}
            >
              <StateName>{stateObj.state_name}</StateName>
              {!selectable && <ComingSoon>Coming soon</ComingSoon>}
            </StateBtn>
          );
        })}
      </Grid>
    </PageWrapper>
  );
}
