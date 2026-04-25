import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_WEEKS = 20;

export type Season = "peak" | "shoulder" | "offSeason";
export type Phase = "plan" | "results" | "done";

export interface HotelState {
  rngSeed: number;
  week: number;
  cash: number;
  phase: Phase;
  rooms: number;         // total rooms (start 10, can buy more at $200 each up to 30)
  ratePerNight: number;  // nightly rate $40-$200
  amenities: number;     // 0-4 amenity upgrades, each costs $100, boosts demand
  marketing: number;     // weekly marketing spend $0-$80
  season: Season;
  lastOccupied: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  guestRating: number;   // 1-5 stars
  log: readonly string[];
}

export type HotelAction =
  | { type: "setRate"; value: number }
  | { type: "setMarketing"; value: number }
  | { type: "buyRoom" }
  | { type: "buyAmenity" }
  | { type: "runWeek" }
  | { type: "nextWeek" };

const SEASON_DEMAND: Record<Season, number> = {
  peak: 1.4,
  shoulder: 1.0,
  offSeason: 0.55,
};

const SEASON_LABEL: Record<Season, string> = {
  peak: "Peak Season",
  shoulder: "Shoulder Season",
  offSeason: "Off Season",
};

function seasonForWeek(week: number): Season {
  const mod = (week - 1) % 10;
  if (mod < 3) return "peak";
  if (mod < 7) return "shoulder";
  return "offSeason";
}

export const ROOM_COST = 200;
export const AMENITY_COST = 100;

export function initialState(seed: number): HotelState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    week: 1,
    cash: 600,
    phase: "plan",
    rooms: 10,
    ratePerNight: 80,
    amenities: 0,
    marketing: 20,
    season: seasonForWeek(1),
    lastOccupied: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    guestRating: 3,
    log: [],
  };
}

export function calcOccupancy(
  rooms: number,
  rate: number,
  amenities: number,
  marketing: number,
  season: Season,
  rating: number,
  rng: () => number,
): number {
  const seasonMult = SEASON_DEMAND[season];
  const amenityBoost = 1 + amenities * 0.12;
  const marketingBoost = 1 + (marketing / 80) * 0.3;
  const ratingBoost = 0.6 + (rating - 1) / 4 * 0.8;
  const priceEffect = Math.max(0, 1 - (rate - 40) / 320);
  const demand = rooms * seasonMult * amenityBoost * marketingBoost * ratingBoost * priceEffect;
  const noise = 0.75 + rng() * 0.5;
  return Math.min(rooms, Math.max(0, Math.round(demand * noise)));
}

export function reducer(state: HotelState, action: HotelAction): HotelState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setRate":
      if (state.phase !== "plan") return state;
      return { ...state, ratePerNight: Math.max(40, Math.min(200, action.value)) };
    case "setMarketing":
      if (state.phase !== "plan") return state;
      return { ...state, marketing: Math.max(0, Math.min(80, action.value)) };
    case "buyRoom":
      if (state.phase !== "plan" || state.rooms >= 30 || state.cash < ROOM_COST) return state;
      return { ...state, rooms: state.rooms + 1, cash: state.cash - ROOM_COST };
    case "buyAmenity":
      if (state.phase !== "plan" || state.amenities >= 4 || state.cash < AMENITY_COST) return state;
      return { ...state, amenities: state.amenities + 1, cash: state.cash - AMENITY_COST };

    case "runWeek": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      // 7 nights per week
      const nightlyOcc = calcOccupancy(state.rooms, state.ratePerNight, state.amenities, state.marketing, state.season, state.guestRating, rng);
      const roomNights = nightlyOcc * 7;
      const revenue = roomNights * state.ratePerNight;
      const opCost = state.rooms * 5 * 7 + state.marketing; // $5/room/night operating cost
      const cost = Math.round(opCost);
      const profit = revenue - cost;
      // Rating adjusts with occupancy
      const occRate = nightlyOcc / state.rooms;
      const ratingDelta = occRate > 0.7 ? 0.2 : occRate < 0.3 ? -0.2 : 0;
      const newRating = Math.max(1, Math.min(5, state.guestRating + ratingDelta));
      const log = `Wk ${state.week} (${SEASON_LABEL[state.season]}): ${nightlyOcc}/${state.rooms} rooms @ $${state.ratePerNight}/night → ${profit >= 0 ? "+" : ""}$${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        lastOccupied: nightlyOcc,
        lastRevenue: revenue,
        lastCost: cost,
        lastProfit: profit,
        guestRating: newRating,
        log: [...state.log, log],
      };
    }

    case "nextWeek": {
      if (state.phase !== "results") return state;
      if (state.week >= TOTAL_WEEKS) return { ...state, phase: "done" };
      const nextWeek = state.week + 1;
      return { ...state, week: nextWeek, season: seasonForWeek(nextWeek), phase: "plan" };
    }
  }
}

export function isTerminal(state: HotelState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 5000) * 100))) };
}

export { SEASON_LABEL };
