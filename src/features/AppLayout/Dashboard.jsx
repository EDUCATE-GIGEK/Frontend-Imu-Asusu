import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LiveContext } from "../../contexts/LiveContext";
import { GoPlusCircle } from "react-icons/go";
import Dropdown from "../../ui/Dropdown";

function Dashboard() {
  const { selectedContinents, selectedCountries } = useContext(LiveContext);
  const navigate = useNavigate();

  return (
    <div>
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
                              navigate("/app/places", {
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

      <NavLink to="/app/my-interests">My Interests</NavLink>

      <NavLink to="/app/my-learning">My Learning</NavLink>

      <div>
        <GoPlusCircle /> <span>Add Places</span>
      </div>
    </div>
  );
}

export default Dashboard;
