import { useState } from "react";
import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import tw from "tailwind-styled-components";

const StyledAppLayout = tw.div`
  grid h-screen transition-all duration-300
  ${(p) => (p.$collapsed ? "grid-cols-[4rem_1fr]" : "grid-cols-[16rem_1fr]")}
`;

// A fixed top bar over a growing, scrollable outlet region — so a page can opt
// into filling the full height (h-full) instead of sitting in a short card. A
// page can also request "bleed": the top bar and padding drop away so it owns
// the entire content cell edge-to-edge (used by the manuscript editor).
const ContentWrapper = tw.div`flex flex-col h-screen overflow-hidden`;
const TopBar = tw.div`flex justify-end items-center gap-4 px-10 pt-6 pb-3 shrink-0`;
const OutletArea = tw.div`
  flex-1 min-h-0
  ${(p) => (p.$bleed ? "overflow-hidden" : "overflow-y-auto px-10 pb-8")}
`;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [bleed, setBleed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Hide Back on the hub itself; show it on every deeper page.
  const showBack = location.pathname !== "/app";

  return (
    <StyledAppLayout $collapsed={collapsed}>
      <Dashboard
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <ContentWrapper>
        {!bleed && (
          <TopBar>
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-title opacity-50 hover:opacity-100 transition-opacity"
              >
                ← Back
              </button>
            )}
            {!user && (
              <Link
                to="/login"
                className="text-sm font-semibold text-title border-2 border-grey-info-outline rounded-lg px-4 py-1.5 hover:border-orange-300 transition-colors"
              >
                Log in
              </Link>
            )}
          </TopBar>
        )}
        <OutletArea $bleed={bleed}>
          <Outlet context={{ setBleed }} />
        </OutletArea>
      </ContentWrapper>
    </StyledAppLayout>
  );
}
