import { useState } from "react";
import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();

  // Hide Back on the hub itself; show it on every deeper page.
  const showBack = location.pathname !== "/app";

  return (
    <StyledAppLayout $collapsed={collapsed}>
      <Dashboard collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <ContentWrapper>
        <div className="flex justify-end items-center gap-4 mb-4">
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
        </div>
        <Outlet />
      </ContentWrapper>
    </StyledAppLayout>
  );
}
