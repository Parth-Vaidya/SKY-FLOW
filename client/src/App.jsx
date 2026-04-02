import { useState } from "react";
import MapView from "./components/MapView";
import FlightDetails from "./components/FlightDetails";
import FlightFilter from "./components/FlightFilter";

export default function App() {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      
      {/* MAP */}
      <MapView
        onSelectFlight={setSelectedFlight}
        filters={filters}
      />

      {/* UI LAYER */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // allows map interaction
          zIndex: 10000,
        }}
      >
        {/* Filter Button */}
        <button
          onClick={() => setShowFilter(true)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "10px 15px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          Filter
        </button>

        {/* Filter Panel */}
        {showFilter && (
          <FlightFilter
            onApply={setFilters}
            onClose={() => setShowFilter(false)}
          />
        )}

        {/* Flight Details */}
        <FlightDetails
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      </div>
    </div>
  );
}