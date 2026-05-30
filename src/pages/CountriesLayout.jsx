import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveContext } from "../contexts/LiveContext";
import { continentsData } from "../data/continentsData";

export default function CountriesLayout() {
  const { selectedContinents, selectedCountries, toggleCountry } =
    useContext(LiveContext);
  const navigate = useNavigate();

  const selectedCount = Object.values(selectedCountries).flat().length;

  if (selectedContinents.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: "1rem",
        }}
      >
        <p style={{ color: "#6c757d" }}>No continents selected.</p>
        <button onClick={() => navigate("/")} style={backBtnStyle}>
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.25rem",
        }}
      >
        <button onClick={() => navigate("/")} style={backBtnStyle}>
          ← Back
        </button>
        <h1 style={{ margin: 0, color: "#212529" }}>Select countries</h1>
      </div>
      <p style={{ color: "#6c757d", marginBottom: "2rem" }}>
        Choose the countries you want to explore within each continent.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {selectedContinents.map((continentId) => {
          const continent = continentsData.find((c) => c.id === continentId);
          if (!continent) return null;

          return (
            <div
              key={continentId}
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #dee2e6",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  background: continent.color,
                  padding: "0.75rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "800",
                    color: "#212529",
                  }}
                >
                  {continent.abbreviation}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#212529",
                  }}
                >
                  {continent.name}
                </span>
              </div>

              {/* Country boxes */}
              {continent.countries.length === 0 ? (
                <p style={{ padding: "1.25rem", color: "#6c757d", margin: 0 }}>
                  No countries to select.
                </p>
              ) : (
                <div
                  style={{
                    padding: "1.25rem",
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "0.6rem",
                  }}
                >
                  {continent.countries.map((country) => {
                    const isSelected = (selectedCountries[continentId] || []).includes(country);
                    return (
                      <button
                        key={country}
                        onClick={() => toggleCountry(continentId, country)}
                        style={{
                          background: isSelected ? "#ffd43b" : "#f8f9fa",
                          border: `2px solid ${isSelected ? "#ffd43b" : "#dee2e6"}`,
                          borderRadius: "8px",
                          padding: "0.5rem 0.4rem",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: isSelected ? "700" : "400",
                          color: "#212529",
                          textAlign: "center",
                          boxShadow: isSelected
                            ? "0 2px 8px rgba(255,212,59,0.35)"
                            : "none",
                          transition: "all 0.12s ease",
                        }}
                      >
                        {country}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/app")}
        style={{
          marginTop: "2rem",
          background: "#ffd43b",
          border: "none",
          borderRadius: "8px",
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          fontWeight: "700",
          color: "#212529",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(255,212,59,0.4)",
        }}
      >
        Next →{" "}
        {selectedCount > 0 && (
          <span style={{ fontWeight: "400" }}>
            {selectedCount} countr{selectedCount > 1 ? "ies" : "y"} selected
          </span>
        )}
      </button>
    </div>
  );
}

const backBtnStyle = {
  background: "transparent",
  border: "2px solid #dee2e6",
  borderRadius: "8px",
  padding: "0.4rem 1rem",
  cursor: "pointer",
  fontSize: "0.9rem",
  color: "#495057",
  fontFamily: "sans-serif",
};
