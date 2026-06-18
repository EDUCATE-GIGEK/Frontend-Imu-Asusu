import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEthnicGroup } from "@/services/apiEthnicGroups";
import { getTribesByEthnicGroup } from "@/services/apiTribes";
import { getHistoryByEthnicGroup } from "@/services/apiHistory";
import GroupedList from "@/ui/GroupedList";
import InfoOption from "@/ui/InfoOption";
import Spacer from "@/ui/Spacer";
import tw from "tailwind-styled-components";

const StyledHeader = tw.h1`text-4xl font-bold mb-4 text-title`;
const StyledDescription = tw.p`
  bg-orange-background-100
  rounded-md
  px-6
  py-4
  h-1/5
  mb-6
  italic
`;
const InfoList = tw.ul`list-disc pl-6 mb-6`;
const EndangeredBadge = tw.span`text-sm font-semibold text-red-600`;

function EthnicGroupPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const ethnicGroupId = state?.ethnicGroupId ?? null;

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

  if (!ethnicGroupId) return <div>No ethnic group selected.</div>;
  if (loadingEG || loadingTribes || loadingHistory) return <div>Loading…</div>;
  if (!eg) return <div>Ethnic group not found.</div>;

  const { general_info: info } = eg;

  const goToTribe = (tribe) =>
    navigate("/app/tribe", {
      state: { tribeId: tribe.id, ethnicGroupId: eg.id },
    });

  return (
    <>
      <StyledHeader>
        {eg.name}
        {info?.isEndangered && <EndangeredBadge> · Endangered</EndangeredBadge>}
      </StyledHeader>
      <StyledDescription>{info?.ethnicGroupDescription}</StyledDescription>

      <InfoList>
        <li>{`${info?.spokenLanguagesCount} Spoken Languages`}</li>
        <li>{`${info?.writtenLanguagesCount} Written Languages`}</li>
        {info?.tribesCount > 0 && <li>{`${info.tribesCount} Tribes`}</li>}
      </InfoList>

      <GroupedList label="Languages">
        <Spacer>
          {(eg.languages ?? []).map((lang) => (
            <InfoOption key={lang} label={lang} />
          ))}
        </Spacer>
      </GroupedList>

      {tribes.length > 0 && (
        <GroupedList label="Tribes">
          <Spacer>
            {tribes.map((tribe) => (
              <InfoOption
                key={tribe.id}
                label={tribe.name}
                onClick={() => goToTribe(tribe)}
              />
            ))}
          </Spacer>
        </GroupedList>
      )}

      {history.length > 0 && (
        <GroupedList label="History">
          <Spacer>
            {history.map((h) => (
              <div key={h.id}>
                <h1>{h.category}</h1>
                <h3>{h.subject_name}</h3>
                <p>{h.subject_description}</p>
              </div>
            ))}
          </Spacer>
        </GroupedList>
      )}
    </>
  );
}

export default EthnicGroupPage;
