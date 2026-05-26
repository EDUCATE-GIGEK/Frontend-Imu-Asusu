// src/components/ContinentGrid.jsx
import { useContext } from "react";
import { motion } from "framer-motion";
import { LiveContext } from "../contexts/LiveContext";
import styles from "../styles/GlobalLayoutGrid.module.css";

const continents = [
  { name: "Africa", color: "#FF6B6B" },
  { name: "Asia", color: "#4ECDC4" },
  { name: "Europe", color: "#45B7D1" },
  { name: "North America", color: "#FFA07A" },
  { name: "South America", color: "#98D8C8" },
  { name: "Oceania", color: "#F7DC6F" },
];

export default function GlobeLayout() {
  const { toggleContinent, setExpandedContinent, selectedContinents } =
    useContext(LiveContext);

  const handleClick = (continent) => {
    toggleContinent(continent.name);
    setExpandedContinent(continent.name);
  };

  return (
    <div className={styles.grid}>
      <h2>Select Continents</h2>
      <div className={styles.continentGrid}>
        {continents.map((continent) => (
          <motion.div
            key={continent.name}
            className={`${styles.continentCard} ${
              selectedContinents.includes(continent.name) ? styles.selected : ""
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(continent)}
            style={{ backgroundColor: continent.color }}
          >
            <span>{continent.name}</span>
            {selectedContinents.includes(continent.name) && (
              <motion.div
                className={styles.checkmark}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
