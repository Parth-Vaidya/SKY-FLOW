import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./app.js";

const PORT = 5000;

console.log("ENV CHECK:", process.env.FLIGHT_FETCH_API_URL);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
