import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 30;

export type Weather = "sunny" | "cloudy" | "hot" | "rainy";

export interface LemonadeState {
  rngSeed: number;
  day: number; // 1-7
  money: number; // cents
  weather: Weather;
  phase: "planning" | "results" | "done";
  // Planning inputs
  price: number; // cents per cup (10-100)
  cups: number; // cups to make (1-50)
  adBudget: number; // ad spend in cents (0-50)
  // Last day results
  lastSold: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  dayLog: readonly string[];
}

export type LemonadeAction =
  | { type: "setPrice"; value: number }
  | { type: "setCups"; value: number }
  | { type: "setAd"; value: number }
  | { type: "sell" }
  | { type: "nextDay" };

const COST_PER_CUP = 4; // cents to make each cup

function weatherForDay(rng: () => number): Weather {
  const r = rng();
  if (r < 0.25) return "rainy";
  if (r < 0.45) return "cloudy";
  if (r < 0.7) return "sunny";
  return "hot";
}

function demandMultiplier(weather: Weather): number {
  switch (weather) {
    case "rainy": return 0.3;
    case "cloudy": return 0.6;
    case "sunny": return 1.0;
    case "hot": return 1.5;
  }
}

export function calcSales(
  cups: number,
  price: number,
  adBudget: number,
  weather: Weather,
  rng: () => number,
): number {
  // Base demand: ad budget boost + weather
  const adBoost = 1 + adBudget / 20;
  const baseDemand = 15 * demandMultiplier(weather) * adBoost;
  // Price sensitivity: cheaper = more demand
  const priceEffect = Math.max(0, 1 - (price - 10) / 90);
  const demand = baseDemand * priceEffect;
  // Randomize ±30%
  const noise = 0.7 + rng() * 0.6;
  const wantToBuy = Math.round(demand * noise);
  return Math.min(cups, Math.max(0, wantToBuy));
}

export function initialState(seed: number): LemonadeState {
  const rng = mulberry32(seed);
  const weather = weatherForDay(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    money: 200, // start with $2.00
    weather,
    phase: "planning",
    price: 25,
    cups: 20,
    adBudget: 10,
    lastSold: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    dayLog: [],
  };
}

export function reducer(state: LemonadeState, action: LemonadeAction): LemonadeState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setPrice":
      if (state.phase !== "planning") return state;
      return { ...state, price: Math.max(10, Math.min(100, action.value)) };
    case "setCups":
      if (state.phase !== "planning") return state;
      return { ...state, cups: Math.max(1, Math.min(50, action.value)) };
    case "setAd":
      if (state.phase !== "planning") return state;
      return { ...state, adBudget: Math.max(0, Math.min(50, action.value)) };

    case "sell": {
      if (state.phase !== "planning") return state;
      const rng = mulberry32(state.rngSeed);
      const sold = calcSales(state.cups, state.price, state.adBudget, state.weather, rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const cost = state.cups * COST_PER_CUP + state.adBudget;
      const revenue = sold * state.price;
      const profit = revenue - cost;
      const newMoney = state.money + profit;
      const wLabel = { sunny: "☀️ Sunny", cloudy: "⛅ Cloudy", hot: "🔥 Hot", rainy: "🌧️ Rainy" }[state.weather];
      const log = `Day ${state.day} (${wLabel}): Made ${state.cups} cups @ ¢${state.price}, ad ¢${state.adBudget} → sold ${sold}. Profit: ${profit >= 0 ? "+" : ""}¢${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        lastSold: sold,
        lastRevenue: revenue,
        lastCost: cost,
        lastProfit: profit,
        money: newMoney,
        dayLog: [...state.dayLog, log],
      };
    }

    case "nextDay": {
      if (state.phase !== "results") return state;
      if (state.day >= TOTAL_DAYS) {
        return { ...state, phase: "done" };
      }
      const rng = mulberry32(state.rngSeed);
      const weather = weatherForDay(rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return {
        ...state,
        rngSeed: nextSeed,
        day: state.day + 1,
        weather,
        phase: "planning",
      };
    }
  }
}

export function isTerminal(state: LemonadeState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score = final money (max reasonable ~1000 cents)
  return { score: Math.max(0, Math.min(100, Math.round((state.money / 1000) * 100))) };
}
