import { useQuery } from "@tanstack/react-query";
import { getEthnicGroupsByState } from "@/services/apiEthnicGroups";
import { getLGsByState } from "@/services/apiLocalGovernments";
import { getState } from "@/services/apiStates";

function useStatePage(stateId) {
  const { data: stateObj, isLoading: loadingState } = useQuery({
    queryKey: ["state", stateId],
    queryFn: () => getState(stateId),
    enabled: !!stateId,
  });

  const { data: lgs = [], isLoading: loadingLGs } = useQuery({
    queryKey: ["lgs", stateId],
    queryFn: () => getLGsByState(stateId),
    enabled: !!stateId,
  });

  const { data: egs = [], isLoading: loadingEGs } = useQuery({
    queryKey: ["ethnicGroups", "state", stateId],
    queryFn: () => getEthnicGroupsByState(stateId),
    enabled: !!stateId,
  });

  return {
    stateObj,
    loadingState,
    lgs,
    loadingLGs,
    egs,
    loadingEGs,
  };
}

export default useStatePage;
