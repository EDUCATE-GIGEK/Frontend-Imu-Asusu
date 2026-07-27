import { useState } from "react";
import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { useAuth } from "@/contexts/AuthContext";
import useAnonMigration from "@/hooks/useAnonMigration";
import useMediaQuery from "@/hooks/useMediaQuery";
import tw from "tailwind-styled-components";

// Below `md` the app is a single column and the sidebar floats over it as an
// off-canvas drawer; at `md`+ the sidebar docks into its own grid column and can
// collapse to a rail. The desktop collapse width never applies on mobile.
const StyledAppLayout = tw.div`
  grid h-screen transition-all duration-300 grid-cols-1
  ${(p) => (p.$collapsed ? "md:grid-cols-[4rem_1fr]" : "md:grid-cols-[16rem_1fr]")}
`;

// A fixed top bar over a growing, scrollable outlet region — so a page can opt
// into filling the full height (h-full) instead of sitting in a short card. A
// page can also request "bleed": the top bar and padding drop away so it owns
// the entire content cell edge-to-edge (used by the manuscript editor).
const ContentWrapper = tw.div`flex flex-col h-screen overflow-hidden min-w-0`;
const TopBar = tw.div`flex justify-between md:justify-end items-center gap-4 px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-3 shrink-0`;
const OutletArea = tw.div`
  flex-1 min-h-0
  ${(p) => (p.$bleed ? "overflow-hidden" : "overflow-y-auto px-4 sm:px-6 lg:px-10 pb-8")}
`;

// Dims the page behind the mobile drawer; tapping it closes the drawer.
const Backdrop = tw.div`fixed inset-0 z-40 bg-black/30 md:hidden`;
const MenuBtn = tw.button`
  md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-title
  bg-transparent border-none cursor-pointer opacity-70 hover:opacity-100
  hover:bg-black/5 transition-all
`;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [bleed, setBleed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Collapse is a desktop affordance; on a phone the drawer is simply open or
  // shut, so the rail state never leaks in (e.g. Timeline auto-collapsing).
  const effectiveCollapsed = isDesktop ? collapsed : false;

  // Claim any work done while signed out into the account, once logged in.
  useAnonMigration();

  // Hide Back on the hub itself; show it on every deeper page.
  const showBack = location.pathname !== "/app";

  return (
    <StyledAppLayout $collapsed={effectiveCollapsed}>
      {mobileNavOpen && <Backdrop onClick={() => setMobileNavOpen(false)} />}
      <Dashboard
        collapsed={effectiveCollapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <ContentWrapper>
        {!bleed && (
          <TopBar>
            <MenuBtn
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <GoSidebarExpand size={18} />
            </MenuBtn>
            <div className="flex items-center gap-4">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="text-sm text-title opacity-50 hover:opacity-100 transition-opacity"
                >
                  ← Back
                </button>
              )}
              {!isLoading && !user && (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-title border-2 border-grey-info-outline rounded-lg px-4 py-1.5 hover:border-orange-300 transition-colors"
                >
                  Log in
                </Link>
              )}
            </div>
          </TopBar>
        )}
        <OutletArea $bleed={bleed}>
          <Outlet context={{ setBleed, setCollapsed, openMobileNav: () => setMobileNavOpen(true) }} />
        </OutletArea>
      </ContentWrapper>
    </StyledAppLayout>
  );
}
