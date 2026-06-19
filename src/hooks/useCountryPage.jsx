import { useQuery } from "@tanstack/react-query";
import { getCountryByName } from "@/services/apiCountries";
import { getStatesByCountry } from "@/services/apiStates";

function useCountryPage(countryName) {
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

  return { country, loadingCountry, states, loadingStates };
}

export default useCountryPage;
