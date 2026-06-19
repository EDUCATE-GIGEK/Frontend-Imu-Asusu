import { useQuery } from "@tanstack/react-query";
import { getLocalGovernment } from "@/services/apiLocalGovernments";
import { getEthnicGroupsByLG } from "@/services/apiEthnicGroups";

function useLocalGovernmentPage(lgId) {
  const { data: lg, isLoading: loadingLG } = useQuery({
    queryKey: ["lg", lgId],
    queryFn: () => getLocalGovernment(lgId),
    enabled: !!lgId,
  });

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["ethnicGroups", "lg", lgId],
    queryFn: () => getEthnicGroupsByLG(lgId),
    enabled: !!lgId,
  });

  return { lg, loadingLG, groups, loadingGroups };
}

export default useLocalGovernmentPage;
