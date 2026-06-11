import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LiveContext } from "../../contexts/LiveContext";
import { GoPlusCircle } from "react-icons/go";
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
  const { selectedContinents, selectedCountries } = useContext(LiveContext);
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
            <Dropdown label={"Places"}>
              {selectedContinents.length > 0 ? (
                selectedContinents.map((continent) => {
                  const countries = selectedCountries[continent] || [];
                  return (
                    <div key={continent}>
                      <Dropdown label={continent}>
                        <ul>
                          {countries.length > 0 ? (
                            countries.map((country) => (
                              <li key={country}>
                                {country}
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate("/app/country", {
                                      state: { country, continent },
                                    })
                                  }
                                >
                                  &rarr;
                                </button>
                              </li>
                            ))
                          ) : (
                            <li>No countries selected</li>
                          )}
                        </ul>
                      </Dropdown>
                    </div>
                  );
                })
              ) : (
                <p>No continents selected</p>
              )}
            </Dropdown>

            <NavLink to="/app/settings">Settings</NavLink>

            <NavLink to="/app/my-learning">
              <p>Learning</p>
            </NavLink>

            <NavLink to="/app/my-manuscripts">
              <p>Manuscripts</p>
            </NavLink>
          </StyledContainer>
        </>
      )}
    </StyledDashboard>
  );
}

export default Dashboard;
