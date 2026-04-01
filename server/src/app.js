import express from "express";
import cors from "cors";
import flightsRoutes from "./routes/flights.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/flights", flightsRoutes);

app.get("/", (req, res) => {
  res.send("OpenSky backend running");
});

export default app;
