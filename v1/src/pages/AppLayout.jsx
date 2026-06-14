import { useState } from "react";
import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet } from "react-router-dom";
import tw from "tailwind-styled-components";

const StyledAppLayout = tw.div`
  grid h-screen transition-all duration-300
  ${(p) => p.$collapsed ? "grid-cols-[4rem_1fr]" : "grid-cols-[24rem_1fr]"}
`;

const ContentWrapper = tw.div`overflow-y-auto h-screen px-16 py-8`;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <StyledAppLayout $collapsed={collapsed}>
      <Dashboard collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </StyledAppLayout>
  );
}
