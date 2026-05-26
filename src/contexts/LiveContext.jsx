// src/contexts/LiveContext.jsx
import { createContext, useState } from "react";

export const LiveContext = createContext();

export default function LiveProvider({ children }) {
  const [selectedContinents, setSelectedContinents] = useState([]);
  const [expandedContinent, setExpandedContinent] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState({});

  const toggleContinent = (continent) => {
    if (selectedContinents.includes(continent)) {
      setSelectedContinents(selectedContinents.filter((c) => c !== continent));
    } else {
      setSelectedContinents([...selectedContinents, continent]);
    }
  };

  const toggleCountry = (continent, country) => {
    const key = `${continent}-${country}`;
    setSelectedCountries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <LiveContext.Provider
      value={{
        selectedContinents,
        toggleContinent,
        expandedContinent,
        setExpandedContinent,
        selectedCountries,
        toggleCountry,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
}
