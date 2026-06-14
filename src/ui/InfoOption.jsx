import { GoChevronRight } from "react-icons/go";
import tw from "tailwind-styled-components";

const StyledInfoOption = tw.div`
  py-2 px-4 flex items-center justify-between rounded-xl outline-grey-info-outline outline-solid outline-offset-2 bg-white-100 transition-all duration-200
  ${(p) => p.$disabled
    ? "opacity-40 cursor-not-allowed"
    : "cursor-pointer hover:outline hover:outline-grey-info-outline hover:bg-grey-info-outline"}
`;

function InfoOption({ label, onClick, disabled }) {
  return (
    <StyledInfoOption onClick={!disabled ? onClick : undefined} $disabled={disabled}>
      <span>{label}</span>
      <GoChevronRight className="justify-self-end" />
    </StyledInfoOption>
  );
}

export default InfoOption;
