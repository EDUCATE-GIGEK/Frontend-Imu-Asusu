import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";

const StyledGroupedList = tw.div`border-b-4 border-grey-info-outline py-16 px-32`;

function GroupedList({ children, label }) {
  return (
    <StyledGroupedList>
      {label && <h2>{label}</h2>}
      {children}
    </StyledGroupedList>
  );
}

export default GroupedList;
