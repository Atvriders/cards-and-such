import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_SEASONS = 10;

export type Crop = "wheat" | "corn" | "tomato";
export type WeatherEvent = "normal" | "drought" | "flood" | "bumper";

export const CROP_PRICES: Record<Crop, number> = { wheat: 3, corn: 5, tomato: 8 };
export const CROP_COSTS: Record<Crop, number> = { wheat: 1, corn: 2, tomato: 3 };
export const GROW_TURNS: Record<Crop, number> = { wheat: 1, corn: 1, tomato: 1 };

export interface Field {
  crop: Crop | null;
  planted: boolean;
}

export interface FarmState {
  rngSeed: number;
  season: number;
  money: number;
  fields: readonly Field[]; // 6 fields
  phase: "planting" | "growing" | "harvest" | "done";
  event: WeatherEvent;
  harvest: number; // bushels harvested last season
  lastProfit: number;
  log: readonly string[];
}

export type FarmAction =
  | { type: "plant"; field: number; crop: Crop }
  | { type: "endPlanting" }
  | { type: "harvest" }
  | { type: "nextSeason" };

function randomEvent(rng: () => number): WeatherEvent {
  const r = rng();
  if (r < 0.15) return "drought";
  if (r < 0.25) return "flood";
  if (r < 0.40) return "bumper";
  return "normal";
}

function yieldMultiplier(event: WeatherEvent): number {
  switch (event) {
    case "drought": return 0.3;
    case "flood": return 0.1;
    case "bumper": return 1.8;
    case "normal": return 1.0;
  }
}

export function initialState(seed: number): FarmState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    season: 1,
    money: 50,
    fields: Array.from({ length: 6 }, () => ({ crop: null, planted: false })),
    phase: "planting",
    event: "normal",
    harvest: 0,
    lastProfit: 0,
    log: [],
  };
}

export function reducer(state: FarmState, action: FarmAction): FarmState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "plant": {
      if (state.phase !== "planting") return state;
      const { field, crop } = action;
      if (field < 0 || field >= 6) return state;
      const f = state.fields[field];
      if (!f || f.planted) return state;
      const cost = CROP_COSTS[crop];
      if (state.money < cost) return { ...state, log: [...state.log, "Not enough money to plant!"] };
      const fields = state.fields.map((ff, i) => i === field ? { crop, planted: true } : ff);
      return { ...state, money: state.money - cost, fields };
    }

    case "endPlanting": {
      if (state.phase !== "planting") return state;
      const rng = mulberry32(state.rngSeed);
      const event = randomEvent(rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return { ...state, rngSeed: nextSeed, phase: "harvest", event };
    }

    case "harvest": {
      if (state.phase !== "harvest") return state;
      const mult = yieldMultiplier(state.event);
      let totalRevenue = 0;
      let totalBushels = 0;
      state.fields.forEach(f => {
        if (f.planted && f.crop) {
          const bushels = Math.round(10 * mult);
          totalBushels += bushels;
          totalRevenue += bushels * CROP_PRICES[f.crop];
        }
      });
      const planted = state.fields.filter(f => f.planted).length;
      const costSunk = state.fields.reduce((s, f) => s + (f.planted && f.crop ? CROP_COSTS[f.crop] : 0), 0);
      const profit = totalRevenue - costSunk;
      const evtLabel = { normal: "☁️ Normal", drought: "🏜️ Drought", flood: "🌊 Flood", bumper: "🌟 Bumper" }[state.event];
      const logLine = `S${state.season} (${evtLabel}): ${planted} fields → $${totalRevenue} revenue. Profit: ${profit >= 0 ? "+" : ""}$${profit}`;
      return {
        ...state,
        money: state.money + totalRevenue,
        harvest: totalBushels,
        lastProfit: profit,
        phase: "growing",
        log: [...state.log, logLine],
      };
    }

    case "nextSeason": {
      if (state.phase !== "growing") return state;
      if (state.season >= TOTAL_SEASONS) return { ...state, phase: "done" };
      return {
        ...state,
        season: state.season + 1,
        fields: Array.from({ length: 6 }, () => ({ crop: null, planted: false })),
        phase: "planting",
        harvest: 0,
      };
    }
  }
}

export function isTerminal(state: FarmState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.money / 500) * 100))) };
}
