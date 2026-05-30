import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet } from "react-router-dom";
import { css, styled } from "styled-components";
// import tw from "twin.macro"; //caused problems
import tw from "tailwind-styled-components"; //this let's you use just tailwind classes without writing css in styled components.

const StyledAppLayout = tw.div`
  flex
  items-center
  justify-center
  bg-gray-100
`

export default function AppLayout() {
  return (
    <StyledAppLayout>
      <Dashboard />
      <Outlet />
    </StyledAppLayout>
  );
}
