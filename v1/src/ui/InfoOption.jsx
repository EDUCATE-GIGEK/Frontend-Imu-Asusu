import { GoChevronRight } from "react-icons/go";
import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";

//Example:
// const StyledInfoOption = styled.div.attrs({
//   className:
//     "",
// })``;

const StyledInfoOption = tw.div`py-2 px-4 cursor-pointer flex items-center justify-between rounded-xl outline-grey-info-outline outline-solid outline-offset-2 bg-white-100 hover:outline  hover:outline-grey-info-outline transition-all duration-200 hover:bg-grey-info-outline`;

function InfoOption({ label, onClick }) {
  return (
    <StyledInfoOption onClick={onClick}>
      <span>{label}</span>
      <GoChevronRight className="justify-self-end" />
    </StyledInfoOption>
  );
}

export default InfoOption;
