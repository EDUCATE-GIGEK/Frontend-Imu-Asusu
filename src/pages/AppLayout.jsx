import { useState } from "react";
import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import tw from "tailwind-styled-components";

const StyledAppLayout = tw.div`
  grid h-screen transition-all duration-300
  ${(p) => p.$collapsed ? "grid-cols-[4rem_1fr]" : "grid-cols-[24rem_1fr]"}
`;

const ContentWrapper = tw.div`overflow-y-auto h-screen px-16 py-8`;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const showBack = location.pathname !== "/app/country";

  return (
    <StyledAppLayout $collapsed={collapsed}>
      <Dashboard collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <ContentWrapper>
        {showBack && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-title opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              ← Back
            </button>
          </div>
        )}
        <Outlet />
      </ContentWrapper>
    </StyledAppLayout>
  );
}
