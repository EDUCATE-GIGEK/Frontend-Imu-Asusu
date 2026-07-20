import { useQuery } from "@tanstack/react-query";
import { getPlace, getChildPlaces, getPeoplesInPlace } from "@/services/apiPlaces";
import { getEntriesInPlaceSubtree } from "@/services/apiEntries";

// One generic hook for any node in the places tree, at any depth.

function usePlacePage(placeId) {
  const { data: place, isLoading: loadingPlace } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => getPlace(placeId),
    enabled: !!placeId,
  });

  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ["place-children", placeId],
    queryFn: () => getChildPlaces(placeId),
    enabled: !!placeId,
  });

  const { data: peoples = [], isLoading: loadingPeoples } = useQuery({
    queryKey: ["place-peoples", placeId],
    queryFn: () => getPeoplesInPlace(placeId),
    enabled: !!placeId,
  });

  const { data: entries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ["place-entries", placeId],
    queryFn: () => getEntriesInPlaceSubtree(placeId),
    enabled: !!placeId,
  });

  // The immediate parent, for the "part of" breadcrumb link.
  const { data: parent } = useQuery({
    queryKey: ["place", place?.parent_id],
    queryFn: () => getPlace(place.parent_id),
    enabled: !!place?.parent_id,
  });

  return {
    place,
    parent,
    children,
    peoples,
    entries,
    loadingPlace,
    loadingChildren,
    loadingPeoples,
    loadingEntries,
  };
}

export default usePlacePage;
