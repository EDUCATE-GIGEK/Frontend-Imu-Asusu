import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet } from "react-router-dom";
import { css, styled } from "styled-components";
// import tw from "twin.macro"; //caused problems
import tw from "tailwind-styled-components"; //this let's you use just tailwind classes without writing css in styled components.

const StyledAppLayout = tw.div`
  grid
  h-screen
  grid-cols-[24rem_1fr]
   grid-rows-[auto_1fr];
 
`;
const ContentWrapper = tw.div`overflow-y-auto h-screen   px-16
  py-8
  `;

export default function AppLayout() {
  return (
    <StyledAppLayout>
      <Dashboard />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </StyledAppLayout>
  );
}
