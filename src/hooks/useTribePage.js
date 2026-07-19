import { useQuery } from "@tanstack/react-query";
import { getTribe } from "@/services/apiTribes";

function useTribePage(tribeId) {
  const { data: tribe, isLoading: loadingTribe } = useQuery({
    queryKey: ["tribe", tribeId],
    queryFn: () => getTribe(tribeId),
    enabled: !!tribeId,
  });

  return { tribe, loadingTribe };
}

export default useTribePage;
