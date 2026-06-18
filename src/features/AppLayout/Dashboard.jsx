import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { GoChevronRight, GoChevronLeft } from "react-icons/go";
import tw from "tailwind-styled-components";

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

const NavBtn = tw.button`
  w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-title opacity-70
  hover:opacity-100 hover:bg-black/5 transition-all duration-150
  bg-transparent border-none cursor-pointer flex items-center gap-2
`;

const NavBtnDisabled = tw.span`
  block rounded-lg px-3 py-2.5 text-sm font-medium text-title opacity-25 cursor-not-allowed
`;

const DropdownContent = tw.div`ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l-2 border-title/10 pl-3`;

const DropdownItem = tw.button`
  w-full text-left rounded-lg px-3 py-2 text-sm text-title opacity-60
  hover:opacity-100 hover:bg-black/5 transition-all duration-150
  bg-transparent border-none cursor-pointer
`;

const Spacer = tw.div`flex-1`;

const EXPLORE_PATHS = ["/app/country", "/app/state", "/app/local-government", "/app/ethnic-group", "/app/tribe"];

function Dashboard({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isExplorePath = EXPLORE_PATHS.some((p) => pathname.startsWith(p));
  const [placesOpen, setPlacesOpen] = useState(false);

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
        <BrandName>EDUCATÉ</BrandName>
        <ToggleBtn onClick={onToggle} title="Collapse sidebar">
          <GoChevronLeft size={16} />
        </ToggleBtn>
      </Header>

      <NavSection>
        <NavLabel>Explore</NavLabel>

        <NavBtn
          type="button"
          onClick={() => setPlacesOpen((o) => !o)}
          className={isExplorePath ? "opacity-100! bg-black/5!" : ""}
        >
          <GoChevronRight
            size={13}
            style={{
              transition: "transform 0.2s ease",
              transform: placesOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
          Places
        </NavBtn>

        {placesOpen && (
          <DropdownContent>
            <DropdownItem
              type="button"
              onClick={() =>
                navigate("/app/country", {
                  state: { country: "Nigeria", continent: "africa" },
                })
              }
              className={isExplorePath ? "opacity-100! bg-orange-300/50! text-title!" : ""}
            >
              Nigeria →
            </DropdownItem>
          </DropdownContent>
        )}
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

        <NavBtnDisabled>Learning</NavBtnDisabled>
        <NavBtnDisabled>Settings</NavBtnDisabled>
      </NavSection>

      <Spacer />
    </StyledDashboard>
  );
}

export default Dashboard;
