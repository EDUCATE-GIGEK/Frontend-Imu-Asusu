import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LiveContext } from "../../contexts/LiveContext";
import { GoPlusCircle } from "react-icons/go";
import Dropdown from "../../ui/Dropdown";
import { css, styled } from "styled-components";
import tw from "tailwind-styled-components";

const StyledDashboard = tw.div`p-16 h-screen  bg-orange-background-100 space-y-4 `;
const StyledContainer = tw.div`justify-center flex flex-col gap-8`;

function Dashboard() {
  const { selectedContinents, selectedCountries } = useContext(LiveContext);
  const navigate = useNavigate();

  return (
    <StyledDashboard>
      <p>EDUCATÉ</p>
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

        <Dropdown label={"Interests"}></Dropdown>

        <NavLink to="/app/my-learning">
          <p>Learning</p>
        </NavLink>

        <div>
          <GoPlusCircle /> <span>Add Places</span>
        </div>
      </StyledContainer>
    </StyledDashboard>
  );
}

export default Dashboard;
