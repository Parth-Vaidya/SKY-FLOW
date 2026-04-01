import { useState } from "react";
import MapView from "./components/MapView";
import FlightDetails from "./components/FlightDetails";

export default function App() {
  const [selectedFlight, setSelectedFlight] = useState(null);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapView onSelectFlight={setSelectedFlight} />
      <FlightDetails flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
    </div>
  );
}
