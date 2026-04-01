import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const getPlaneIcon = (heading = 0) =>
  new L.DivIcon({
    className: "plane-icon-wrapper",
    html: `
      <img
        src="/flight2.png"
        style="
          width:35px;
          height:35px;
          transform: rotate(${heading}deg);
          transform-origin: center;
        "
      />
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });


function BoundsFetcher({ setFlights }) {
  useMapEvents({
    moveend: async (e) => {
      const map = e.target;
      const b = map.getBounds();

      try {
        const res = await axios.get("http://localhost:5000/api/flights", {
          params: {
            lamin: b.getSouth(),
            lomin: b.getWest(),
            lamax: b.getNorth(),
            lomax: b.getEast(),
          },
        });

        setFlights(res.data.flights || []);
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    },
  });

  return null;
}


export default function MapView({ onSelectFlight }) {
  const [flights, setFlights] = useState([]);

  // Initial load
  useEffect(() => {
    const loadFlights = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/flights");
        setFlights(res.data.flights || []);
      } catch (err) {
        console.error(err.message);
      }
    };

    loadFlights();
  }, []);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BoundsFetcher setFlights={setFlights} />

      {flights.slice(0, 800).map((f) => (
        <Marker
          key={f.icao24}
          position={[f.lat, f.lon]}
          icon={getPlaneIcon(f.heading)}
          eventHandlers={{
            click: () => onSelectFlight?.(f),
          }}
        >
          <Popup>
            <b>{f.callsign || "N/A"}</b>
            <br />
            {f.country || "Unknown"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
