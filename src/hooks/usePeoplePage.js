import { useQuery } from "@tanstack/react-query";
import {
  getPeople,
  getChildPeoples,
  getPlacesForPeople,
  getLanguagesForPeople,
  getFiguresForPeople,
} from "@/services/apiPeoples";
import { getEntriesInPeopleSubtree } from "@/services/apiEntries";

// One generic hook for any node in the peoples tree, at any depth. Mirrors usePlacePage.
function usePeoplePage(peopleId) {
  const { data: people, isLoading: loadingPeople } = useQuery({
    queryKey: ["people", peopleId],
    queryFn: () => getPeople(peopleId),
    enabled: !!peopleId,
  });

  const { data: children = [] } = useQuery({
    queryKey: ["people-children", peopleId],
    queryFn: () => getChildPeoples(peopleId),
    enabled: !!peopleId,
  });

  const { data: places = [] } = useQuery({
    queryKey: ["people-places", peopleId],
    queryFn: () => getPlacesForPeople(peopleId),
    enabled: !!peopleId,
  });

  const { data: languages = [] } = useQuery({
    queryKey: ["people-languages", peopleId],
    queryFn: () => getLanguagesForPeople(peopleId),
    enabled: !!peopleId,
  });

  const { data: figures = [] } = useQuery({
    queryKey: ["people-figures", peopleId],
    queryFn: () => getFiguresForPeople(peopleId),
    enabled: !!peopleId,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["people-entries", peopleId],
    queryFn: () => getEntriesInPeopleSubtree(peopleId),
    enabled: !!peopleId,
  });

  // Immediate parent group, for the "part of" breadcrumb.
  const { data: parent } = useQuery({
    queryKey: ["people", people?.parent_id],
    queryFn: () => getPeople(people.parent_id),
    enabled: !!people?.parent_id,
  });

  return { people, parent, children, places, languages, figures, entries, loadingPeople };
}

export default usePeoplePage;
