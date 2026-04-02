import { useState } from "react";

export default function FlightFilter({ onApply, onClose }) {
  const [country, setCountry] = useState("");
  const [minAltitude, setMinAltitude] = useState("");
  const [maxAltitude, setMaxAltitude] = useState("");

  const applyFilter = () => {
    onApply({
      country,
      minAltitude: Number(minAltitude),
      maxAltitude: Number(maxAltitude),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 20,
        width: "260px",
        background: "white",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
        zIndex: 10001,
        pointerEvents: "auto",
      }}
    >
      <h3>Filter Flights</h3>

      <input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Min Altitude"
        value={minAltitude}
        onChange={(e) => setMinAltitude(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Max Altitude"
        value={maxAltitude}
        onChange={(e) => setMaxAltitude(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <button
        onClick={applyFilter}
        style={{
          width: "100%",
          padding: "8px",
          border: "none",
          background: "blue",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "5px",
        }}
      >
        Apply
      </button>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "8px",
          border: "none",
          background: "gray",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  );
}