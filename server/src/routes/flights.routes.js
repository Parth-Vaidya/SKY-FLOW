import express from "express";
import { fetchFlightsInBounds } from "../services/opensky.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { lamin, lomin, lamax, lomax } = req.query;
    console.log("Bounds:", lamin, lomin, lamax, lomax);

    const flights = await fetchFlightsInBounds({ lamin, lomin, lamax, lomax });
    res.json({ flights, count: flights.length });
  } catch (err) {
    console.error("BACKEND ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch flights", error: err.message });
  }
});

export default router;