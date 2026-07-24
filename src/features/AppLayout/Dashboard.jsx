import { NavLink, useNavigate } from "react-router-dom";
import { GoChevronRight, GoChevronLeft, GoSignOut, GoHome } from "react-icons/go";
import tw from "tailwind-styled-components";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/auth/signOut";
import RegionSearch from "./RegionSearch";

const StyledDashboard = tw.div`
  h-screen bg-orange-background-100 overflow-hidden transition-all duration-300
  flex flex-col border-r border-grey-info-outline
  ${(p) => (p.$collapsed ? "p-4 items-center" : "px-5 py-6")}
`;

const Header = tw.div`flex items-center justify-between w-full mb-8`;

const BrandName = tw.p`text-title font-bold text-lg tracking-tight`;

const ToggleBtn = tw.button`
  flex items-center justify-center w-8 h-8 rounded-lg
  bg-transparent border-none cursor-pointer text-title opacity-50
  hover:opacity-100 hover:bg-black/5 transition-all duration-150
`;

const NavSection = tw.div`flex flex-col gap-1 w-full`;

const NavLabel = tw.p`text-xs font-semibold text-title opacity-40 uppercase tracking-widest px-2 mb-1.5`;

const NavBtnDisabled = tw.span`
  block rounded-lg px-3 py-2.5 text-sm font-medium text-title opacity-25 cursor-not-allowed
`;

const Spacer = tw.div`flex-1`;

const LogoutBtn = tw.button`
  w-full text-left rounded-lg px-3 py-2.5 text-sm font-bold text-title
  flex items-center gap-2
  hover:bg-black/10 transition-all duration-150
  bg-transparent border-none cursor-pointer
`;

function Dashboard({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  if (collapsed) {
    return (
      <StyledDashboard $collapsed={collapsed}>
        <ToggleBtn onClick={onToggle} title="Expand sidebar">
          <GoChevronRight size={16} />
        </ToggleBtn>
      </StyledDashboard>
    );
  }

  return (
    <StyledDashboard $collapsed={collapsed}>
      <Header>
        <BrandName>ỊMỤ-ASỤSỤ</BrandName>
        <ToggleBtn onClick={onToggle} title="Collapse sidebar">
          <GoChevronLeft size={16} />
        </ToggleBtn>
      </Header>

      <NavSection>
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            isActive
              ? "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline bg-orange-300/50 text-title flex items-center gap-2"
              : "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline text-title opacity-70 hover:opacity-100 hover:bg-black/5 transition-all duration-150 flex items-center gap-2"
          }
        >
          <GoHome size={15} />
          Home
        </NavLink>
      </NavSection>

      <NavSection className="mt-6">
        <NavLabel>Explore</NavLabel>

        <RegionSearch />

        <NavLink
          to="/app/my-timeline"
          className={({ isActive }) =>
            isActive
              ? "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline bg-orange-300/50 text-title"
              : "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline text-title opacity-70 hover:opacity-100 hover:bg-black/5 transition-all duration-150"
          }
        >
          Timelines
        </NavLink>

        <NavLink
          to="/app/collaborate"
          className={({ isActive }) =>
            isActive
              ? "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline bg-orange-300/50 text-title"
              : "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline text-title opacity-70 hover:opacity-100 hover:bg-black/5 transition-all duration-150"
          }
        >
          Collaborate
        </NavLink>
      </NavSection>

      <NavSection className="mt-6">
        <NavLabel>My Space</NavLabel>

        <NavLink
          to="/app/my-manuscripts"
          className={({ isActive }) =>
            isActive
              ? "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline bg-orange-300/50 text-title"
              : "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline text-title opacity-70 hover:opacity-100 hover:bg-black/5 transition-all duration-150"
          }
        >
          Manuscripts
        </NavLink>

        <NavLink
          to="/app/my-notes"
          className={({ isActive }) =>
            isActive
              ? "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline bg-orange-300/50 text-title"
              : "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline text-title opacity-70 hover:opacity-100 hover:bg-black/5 transition-all duration-150"
          }
        >
          Notes
        </NavLink>

        <NavBtnDisabled>Learning</NavBtnDisabled>
        <NavBtnDisabled>Settings</NavBtnDisabled>
      </NavSection>

      <Spacer />

      {user && (
        <LogoutBtn type="button" onClick={handleSignOut}>
          <GoSignOut size={15} />
          Log out
        </LogoutBtn>
      )}
    </StyledDashboard>
  );
}

export default Dashboard;
