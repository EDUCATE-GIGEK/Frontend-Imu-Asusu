import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";

const StyledSpacer = tw.div`py-4 flex flex-row  flex-wrap gap-5 items-center`;

function Spacer({ children }) {
  return <StyledSpacer>{children}</StyledSpacer>;
}

export default Spacer;
