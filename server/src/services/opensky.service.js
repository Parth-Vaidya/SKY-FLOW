import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ─── Cache ────────────────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 120_000; // 2 minutes

// ─── Rate-limit / throttle state ─────────────────────────────────────────────
let rateLimitedUntil = 0;
let lastFetchTime    = 0;
const MIN_REQUEST_GAP_MS = 10_000; // OpenSky requires ≥10s between requests per IP

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCacheKey(lamin, lomin, lamax, lomax) {
  const r = (v) => Math.round(parseFloat(v) * 10) / 10;
  return `${r(lamin)},${r(lomin)},${r(lamax)},${r(lomax)}`;
}

function evictStaleCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.fetchedAt > CACHE_TTL_MS) cache.delete(key);
  }
}

function parseStates(states) {
  return states
    .map((s) => ({
      icao24:       s[0],
      callsign:     s[1]?.trim() || "N/A",
      country:      s[2],
      lon:          s[5],
      lat:          s[6],
      altitude:     s[7],
      velocity:     s[9],
      heading:      s[10],
      last_contact: s[4],
    }))
    .filter((f) => f.lat !== null && f.lon !== null);
}

function getBestCacheFallback(cacheKey) {
  const exact = cache.get(cacheKey);
  if (exact) return exact.flights;
  const any = [...cache.values()].sort((a, b) => b.fetchedAt - a.fetchedAt)[0];
  return any ? any.flights : [];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchFlightsInBounds({ lamin, lomin, lamax, lomax }) {
  const now      = Date.now();
  const cacheKey = buildCacheKey(lamin, lomin, lamax, lomax);

  // 1. Hard rate-limit backoff — return cache, never hit OpenSky
  if (now < rateLimitedUntil) {
    const waitSec = Math.ceil((rateLimitedUntil - now) / 1000);
    console.warn(`[OpenSky] Rate-limited — ${waitSec}s remaining. Serving cache.`);
    return getBestCacheFallback(cacheKey);
  }

  evictStaleCache();

  // 2. Cache hit
  const cached = cache.get(cacheKey);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    console.log(`[OpenSky] Cache hit (key=${cacheKey})`);
    return cached.flights;
  }

  // 3. Throttle — enforce minimum 10s gap between real requests
  const timeSinceLast = now - lastFetchTime;
  if (timeSinceLast < MIN_REQUEST_GAP_MS) {
    const waitMs = MIN_REQUEST_GAP_MS - timeSinceLast;
    console.log(`[OpenSky] Throttling — waiting ${waitMs}ms before next request.`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  // 4. Fetch from OpenSky
  const baseUrl = process.env.FLIGHT_FETCH_API_URL;
  if (!baseUrl) throw new Error("FLIGHT_FETCH_API_URL missing in .env");

  const url = `${baseUrl}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  console.log("[OpenSky] Fetching NEW data:", url);

  lastFetchTime = Date.now();

  try {
    const response = await axios.get(url, {
      auth:
        process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD
          ? { username: process.env.OPENSKY_USERNAME, password: process.env.OPENSKY_PASSWORD }
          : undefined,
      timeout: 10_000,
    });

    const data = response.data;
    if (!data || !data.states) return [];

    const flights = parseStates(data.states);
    cache.set(cacheKey, { flights, fetchedAt: Date.now() });
    console.log(`[OpenSky] Fetched ${flights.length} real flights.`);
    return flights;

  } catch (err) {
    if (err.response?.status === 429) {
      const retryAfter = err.response.headers?.["retry-after"];
      const backoffMs  = retryAfter ? parseInt(retryAfter, 10) * 1000 : 120_000;
      rateLimitedUntil = Date.now() + backoffMs;
      console.warn(
        `[OpenSky] 429 received. Backing off ${backoffMs / 1000}s ` +
        `(until ${new Date(rateLimitedUntil).toISOString()}).`
      );
    } else {
      console.error("[OpenSky] API Error:", err.message);
    }

    // Always return best available cache on any error
    return getBestCacheFallback(cacheKey);
  }
}