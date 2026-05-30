import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LiveContext } from "../contexts/LiveContext";
import { continentsData } from "../data/continentsData";

export default function ContinentsLayout() {
  const { selectedContinents, toggleContinent } = useContext(LiveContext);
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ color: "#212529", marginBottom: "0.25rem" }}>
        Where are you interested in?
      </h1>
      <p style={{ color: "#6c757d", marginBottom: "2rem" }}>
        Select one or more continents to explore.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          maxWidth: "720px",
        }}
      >
        {continentsData.map((continent) => {
          const isSelected = selectedContinents.includes(continent.id);
          return (
            <button
              key={continent.id}
              onClick={() => toggleContinent(continent.id)}
              style={{
                background: isSelected ? "#ffd43b" : "#ffffff",
                border: `2px solid ${isSelected ? "#ffd43b" : "#dee2e6"}`,
                borderRadius: "12px",
                padding: "1.5rem 1rem",
                cursor: "pointer",
                textAlign: "center",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(255,212,59,0.35)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "800",
                  color: "#212529",
                }}
              >
                {continent.abbreviation}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#495057",
                  marginTop: "0.25rem",
                }}
              >
                {continent.name}
              </div>
            </button>
          );
        })}
      </div>

      {selectedContinents.length > 0 && (
        <button
          onClick={() => navigate("/countries")}
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
          <span style={{ fontWeight: "400" }}>
            {selectedContinents.length} continent
            {selectedContinents.length > 1 ? "s" : ""} selected
          </span>
        </button>
      )}
    </div>
  );
}
