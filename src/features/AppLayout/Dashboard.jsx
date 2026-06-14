import { NavLink, useNavigate } from "react-router-dom";

const DisabledLink = tw.span`opacity-40 cursor-not-allowed`;
import { RxHamburgerMenu } from "react-icons/rx";
import Dropdown from "../../ui/Dropdown";
import tw from "tailwind-styled-components";

const StyledDashboard = tw.div`
  h-screen bg-orange-background-100 overflow-hidden transition-all duration-300 flex flex-col
  ${(p) => (p.$collapsed ? "p-2 items-center" : "p-8")}
`;

const ToggleBtn = tw.button`
  bg-transparent border-none cursor-pointer text-xl text-gray-500 hover:text-gray-900 transition-colors self-start
`;

const StyledContainer = tw.div`flex flex-col gap-8 mt-6`;

function Dashboard({ collapsed, onToggle }) {
  const navigate = useNavigate();

  return (
    <StyledDashboard $collapsed={collapsed}>
      <ToggleBtn onClick={onToggle}>
        <RxHamburgerMenu />
      </ToggleBtn>

      {!collapsed && (
        <>
          <p className="mt-4 font-bold text-lg">EDUCATÉ</p>
          <StyledContainer>
            <Dropdown label="Places">
              <button
                type="button"
                onClick={() => navigate("/app/country", { state: { country: "Nigeria", continent: "africa" } })}
              >
                Nigeria &rarr;
              </button>
            </Dropdown>
            <DisabledLink>Settings</DisabledLink>
            <DisabledLink>Learning</DisabledLink>
            <NavLink to="/app/my-manuscripts">Manuscripts</NavLink>
          </StyledContainer>
        </>
      )}
    </StyledDashboard>
  );
}

export default Dashboard;
