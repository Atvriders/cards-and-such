import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Country { name: string; region: string; lat: number; lon: number; }

export const COUNTRIES: Country[] = [
  { name: "FRANCE", region: "EU", lat: 46, lon: 2 },
  { name: "GERMANY", region: "EU", lat: 51, lon: 9 },
  { name: "SPAIN", region: "EU", lat: 40, lon: -4 },
  { name: "ITALY", region: "EU", lat: 42, lon: 12 },
  { name: "PORTUGAL", region: "EU", lat: 39, lon: -8 },
  { name: "POLAND", region: "EU", lat: 52, lon: 19 },
  { name: "GREECE", region: "EU", lat: 39, lon: 22 },
  { name: "NORWAY", region: "EU", lat: 60, lon: 8 },
  { name: "JAPAN", region: "ASIA_E", lat: 36, lon: 138 },
  { name: "CHINA", region: "ASIA_E", lat: 35, lon: 105 },
  { name: "KOREA", region: "ASIA_E", lat: 36, lon: 127 },
  { name: "INDIA", region: "ASIA_S", lat: 20, lon: 77 },
  { name: "VIETNAM", region: "ASIA_SE", lat: 14, lon: 108 },
  { name: "THAILAND", region: "ASIA_SE", lat: 15, lon: 100 },
  { name: "INDONESIA", region: "ASIA_SE", lat: -2, lon: 118 },
  { name: "EGYPT", region: "AFR_N", lat: 26, lon: 30 },
  { name: "MOROCCO", region: "AFR_N", lat: 32, lon: -7 },
  { name: "KENYA", region: "AFR_E", lat: 0, lon: 37 },
  { name: "NIGERIA", region: "AFR_W", lat: 9, lon: 8 },
  { name: "SOUTHAFRICA", region: "AFR_S", lat: -29, lon: 24 },
  { name: "USA", region: "AM_N", lat: 38, lon: -98 },
  { name: "CANADA", region: "AM_N", lat: 56, lon: -106 },
  { name: "MEXICO", region: "AM_N", lat: 23, lon: -102 },
  { name: "BRAZIL", region: "AM_S", lat: -14, lon: -52 },
  { name: "ARGENTINA", region: "AM_S", lat: -34, lon: -64 },
  { name: "CHILE", region: "AM_S", lat: -36, lon: -71 },
  { name: "AUSTRALIA", region: "OCE", lat: -25, lon: 133 },
  { name: "NEWZEALAND", region: "OCE", lat: -40, lon: 174 },
  { name: "RUSSIA", region: "EU_E", lat: 60, lon: 100 },
  { name: "TURKEY", region: "ASIA_W", lat: 38, lon: 35 },
];

export type Direction = "N"|"NE"|"E"|"SE"|"S"|"SW"|"W"|"NW"|"HERE";

export interface Guess {
  name: string;
  distance: number;
  direction: Direction;
}

export interface WorldleCountrySettings {
  rounds: "5" | "8" | "10";
}

export interface WorldleCountryState {
  answer: Country;
  guesses: Guess[];
  current: string;
  status: "playing" | "won" | "lost";
  message: string;
  maxGuesses: number;
}

export type WorldleCountryAction =
  | { type: "key"; ch: string }
  | { type: "backspace" }
  | { type: "enter" }
  | { type: "reset" };

export function distKm(a: Country, b: Country): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

export function bucketDistance(km: number): number {
  if (km < 100) return 0;
  if (km < 1000) return 1;
  if (km < 3000) return 2;
  if (km < 6000) return 3;
  if (km < 10000) return 4;
  return 5;
}

export function direction(from: Country, to: Country): Direction {
  if (from.name === to.name) return "HERE";
  const dy = to.lat - from.lat;
  const dx = to.lon - from.lon;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;
  const a = (ang + 360) % 360;
  if (a < 22.5 || a >= 337.5) return "E";
  if (a < 67.5) return "NE";
  if (a < 112.5) return "N";
  if (a < 157.5) return "NW";
  if (a < 202.5) return "W";
  if (a < 247.5) return "SW";
  if (a < 292.5) return "S";
  return "SE";
}

export function findCountry(name: string): Country | undefined {
  const u = name.toUpperCase().replace(/\s/g, "");
  return COUNTRIES.find(c => c.name === u);
}

export function initialState(seed: number, settings: WorldleCountrySettings): WorldleCountryState {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * COUNTRIES.length);
  return {
    answer: COUNTRIES[idx]!,
    guesses: [],
    current: "",
    status: "playing",
    message: "",
    maxGuesses: parseInt(settings.rounds, 10),
  };
}

export function reducer(state: WorldleCountryState, action: WorldleCountryAction): WorldleCountryState {
  if (state.status !== "playing" && action.type !== "reset") return state;
  switch (action.type) {
    case "key":
      if (!/^[a-zA-Z]$/.test(action.ch)) return state;
      return { ...state, current: state.current + action.ch.toUpperCase(), message: "" };
    case "backspace":
      return { ...state, current: state.current.slice(0, -1), message: "" };
    case "enter": {
      const c = findCountry(state.current);
      if (!c) return { ...state, message: "Not a country" };
      const km = distKm(c, state.answer);
      const bucket = bucketDistance(km);
      const dir = direction(c, state.answer);
      const guess: Guess = { name: c.name, distance: bucket, direction: dir };
      const guesses = [...state.guesses, guess];
      if (c.name === state.answer.name) return { ...state, guesses, current: "", status: "won", message: "Correct!" };
      if (guesses.length >= state.maxGuesses) return { ...state, guesses, current: "", status: "lost", message: "" };
      return { ...state, guesses, current: "", message: "" };
    }
    case "reset":
      return initialState(0, { rounds: state.maxGuesses.toString() as WorldleCountrySettings["rounds"] });
    default: return state;
  }
}

export function isTerminal(state: WorldleCountryState): { score: number } | null {
  if (state.status === "won") return { score: Math.max(0, (state.maxGuesses - state.guesses.length + 1) * 100) };
  if (state.status === "lost") return { score: 0 };
  return null;
}
