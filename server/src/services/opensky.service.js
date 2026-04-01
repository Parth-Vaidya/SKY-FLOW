import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function fetchFlightsInBounds({ lamin, lomin, lamax, lomax }) {
  const baseUrl = process.env.FLIGHT_FETCH_API_URL;

  if (!baseUrl) {
    throw new Error("FLIGHT_FETCH_API_URL is not defined in .env");
  }

  let url = baseUrl;

  if (lamin && lomin && lamax && lomax) {
    url = `${baseUrl}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  }

  console.log("Requesting:", url);

  const { data } = await axios.get(url);

  if (!data || !data.states) return [];

  return data.states
    .map((s) => ({
      icao24: s[0],
      callsign: s[1]?.trim() || "N/A",
      country: s[2],
      lon: s[5],
      lat: s[6],
      altitude: s[7],
      velocity: s[9],
      heading: s[10],
      last_contact: s[4],
    }))
    .filter((f) => f.lat !== null && f.lon !== null);
}
