import { useQuery } from "@tanstack/react-query";
import { getEthnicGroup } from "@/services/apiEthnicGroups";
import { getTribesByEthnicGroup } from "@/services/apiTribes";
import { getHistoryByEthnicGroup } from "@/services/apiHistory";

function useEthnicGroupPage(ethnicGroupId) {
  const { data: eg, isLoading: loadingEG } = useQuery({
    queryKey: ["ethnicGroup", ethnicGroupId],
    queryFn: () => getEthnicGroup(ethnicGroupId),
    enabled: !!ethnicGroupId,
  });

  const { data: tribes = [], isLoading: loadingTribes } = useQuery({
    queryKey: ["tribes", ethnicGroupId],
    queryFn: () => getTribesByEthnicGroup(ethnicGroupId),
    enabled: !!ethnicGroupId,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["history", ethnicGroupId],
    queryFn: () => getHistoryByEthnicGroup(ethnicGroupId),
    enabled: !!ethnicGroupId,
  });

  return { eg, loadingEG, tribes, loadingTribes, history, loadingHistory };
}

export default useEthnicGroupPage;
