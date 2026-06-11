import { useLocation, useNavigate } from "react-router-dom";
import { ethnicGroupData } from "@/data/ethnicGroupData";
import { tribesData } from "@/data/tribesData";
import { historyData } from "@/data/historyData";
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

  const eg = state
    ? ethnicGroupData.find((e) => e.ethnic_group_id === state.ethnic_group_id)
    : null;

  if (!eg) return <div>No ethnic group selected.</div>;

  const tribes =
    eg.general_info.tribesCount > 0
      ? tribesData.filter((t) => t.ethnic_group_id === eg.ethnic_group_id)
      : [];

  const { general_info: info } = eg;

  const goToTribe = (tribe) =>
    navigate("/app/tribe", {
      state: {
        tribe_id: tribe.tribe_id,
        ethnic_group_id: eg.ethnic_group_id,
        country: state.country,
        continent: state.continent,
      },
    });

  return (
    <>
      <StyledHeader>
        {eg.name}
        {info.isEndangered && <EndangeredBadge> · Endangered</EndangeredBadge>}
      </StyledHeader>
      <StyledDescription>{info.ethnicGroupDescription}</StyledDescription>

      <InfoList>
        <li>{`${info.spokenLanguagesCount} Spoken Languages`}</li>
        <li>{`${info.writtenLanguagesCount} Written Languages`}</li>
        {info.tribesCount > 0 && <li>{`${info.tribesCount} Tribes`}</li>}
      </InfoList>

      <GroupedList label="Languages">
        <Spacer>
          {eg.languages.map((lang) => (
            <InfoOption key={lang} label={lang} />
          ))}
        </Spacer>
      </GroupedList>

      {tribes.length > 0 && (
        <GroupedList label="Tribes">
          <Spacer>
            {tribes.map((tribe) => (
              <InfoOption
                key={tribe.tribe_id}
                label={tribe.name}
                onClick={() => goToTribe(tribe)}
              />
            ))}
          </Spacer>
        </GroupedList>
      )}

      {historyData.filter((h) => h.ethnic_group_id === eg.ethnic_group_id)
        .length > 0 && (
        <GroupedList label="History">
          <Spacer>
            {historyData
              .filter((h) => h.ethnic_group_id === eg.ethnic_group_id)
              .map((h) => (
                <div key={h.category}>
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
