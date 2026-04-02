import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function applyFilters(flights, filters) {
  if (!Array.isArray(flights)) return [];
  return flights.filter((f) => {
    if (filters.country && f.country !== filters.country) return false;
    if (filters.minAltitude && f.altitude < filters.minAltitude) return false;
    if (filters.maxAltitude && f.altitude > filters.maxAltitude) return false;
    return true;
  });
}

const MOVE_DEBOUNCE_MS = 5_000;
const AUTO_REFRESH_MS  = 60_000;

function FetchFlights({ setFlights, filters }) {
  const map         = useMap();
  const debounceRef = useRef(null);
  const intervalRef = useRef(null);
  const isFetching  = useRef(false);

  const loadFlights = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const bounds = map.getBounds();
      const res = await axios.get("http://localhost:5000/api/flights", {
        params: {
          lamin: bounds.getSouth(),
          lomin: bounds.getWest(),
          lamax: bounds.getNorth(),
          lomax: bounds.getEast(),
        },
      });

      let flights = res.data.flights;
      if (!Array.isArray(flights)) return;
      setFlights(applyFilters(flights, filters));
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn("Rate limited — will retry on next refresh.");
      } else {
        console.error("Error fetching flights:", err.message);
      }
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    loadFlights();
    intervalRef.current = setInterval(loadFlights, AUTO_REFRESH_MS);

    const onMoveEnd = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(loadFlights, MOVE_DEBOUNCE_MS);
    };
    map.on("moveend", onMoveEnd);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(debounceRef.current);
      map.off("moveend", onMoveEnd);
    };
  }, [filters]);

  return null;
}

export default function MapView({ onSelectFlight, filters }) {
  const [flights, setFlights] = useState([]);

  return (
    <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FetchFlights setFlights={setFlights} filters={filters} />
      {flights.map((flight) => (
        <Marker
          key={flight.icao24}
          position={[flight.lat, flight.lon]}
          eventHandlers={{ click: () => onSelectFlight(flight) }}
        >
          <Popup>
            <b>{flight.callsign}</b><br />
            Country: {flight.country}<br />
            Altitude: {flight.altitude} m<br />
            Speed: {flight.velocity} m/s
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}