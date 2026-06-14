import { useLocation } from "react-router-dom";
import { tribesData } from "@/data/tribesData";
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

function TribePage() {
  const { state } = useLocation();

  const tribe = state ? tribesData.find((t) => t.tribe_id === state.tribe_id) : null;

  if (!tribe) return <div>No tribe selected.</div>;

  const { general_info: info } = tribe;

  return (
    <>
      <StyledHeader>
        {tribe.name}
        {info.isEndangered && <EndangeredBadge> · Endangered</EndangeredBadge>}
      </StyledHeader>
      <StyledDescription>{info.tribeDescription}</StyledDescription>

      <InfoList>
        <li>{`${info.spokenLanguagesCount} Spoken Languages`}</li>
        <li>{`${info.writtenLanguagesCount} Written Languages`}</li>
      </InfoList>

      <GroupedList label="Languages">
        <Spacer>
          {tribe.languages.map((lang) => (
            <InfoOption key={lang} label={lang} />
          ))}
        </Spacer>
      </GroupedList>
    </>
  );
}

export default TribePage;
