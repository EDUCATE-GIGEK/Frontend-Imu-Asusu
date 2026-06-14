import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";

const StyledGroupedList = tw.div` py-2 px-8`;
const StyledHeader = tw.h1`
  text-2xl
  font-bold

  text-title
`;

function GroupedList({ children, label }) {
  return (
    <>
      {label && <StyledHeader>{label}</StyledHeader>}
      <StyledGroupedList>{children}</StyledGroupedList>
    </>
  );
}

export default GroupedList;
