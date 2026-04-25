import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 20;

export type Filling = "beef" | "chicken" | "veggie" | "shrimp";
export type Phase = "plan" | "results" | "done";

export interface TacoState {
  rngSeed: number;
  day: number;
  cash: number;
  phase: Phase;
  tacoCount: number;    // tacos to prepare 1-60
  tacoPrice: number;    // price per taco $2-10
  filling: Filling;
  salsaLevel: number;   // 0-3 upgrade
  locationLevel: number; // 0-3 upgrade
  lastSold: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  log: readonly string[];
}

export type TacoAction =
  | { type: "setCount"; value: number }
  | { type: "setPrice"; value: number }
  | { type: "setFilling"; value: Filling }
  | { type: "buySalsa" }
  | { type: "buyLocation" }
  | { type: "openDay" }
  | { type: "nextDay" };

export const FILLINGS: Record<Filling, { label: string; cost: number; baseDemand: number }> = {
  beef:    { label: "Beef",    cost: 0.8, baseDemand: 28 },
  chicken: { label: "Chicken", cost: 0.6, baseDemand: 24 },
  veggie:  { label: "Veggie",  cost: 0.4, baseDemand: 18 },
  shrimp:  { label: "Shrimp",  cost: 1.2, baseDemand: 20 },
};

export const SALSA_COST = 25;
export const LOCATION_COST = 40;

export function initialState(seed: number): TacoState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    cash: 120,
    phase: "plan",
    tacoCount: 25,
    tacoPrice: 4,
    filling: "beef",
    salsaLevel: 0,
    locationLevel: 0,
    lastSold: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    log: [],
  };
}

export function calcSold(
  count: number,
  price: number,
  filling: Filling,
  salsa: number,
  location: number,
  rng: () => number,
): number {
  const info = FILLINGS[filling];
  const salsaBoost = 1 + salsa * 0.12;
  const locationBoost = 1 + location * 0.18;
  const priceEffect = Math.max(0, 1 - (price - 2) / 16);
  const demand = info.baseDemand * priceEffect * salsaBoost * locationBoost;
  const want = Math.round(demand * (0.65 + rng() * 0.7));
  return Math.min(count, Math.max(0, want));
}

export function reducer(state: TacoState, action: TacoAction): TacoState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setCount":
      if (state.phase !== "plan") return state;
      return { ...state, tacoCount: Math.max(1, Math.min(60, action.value)) };
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, tacoPrice: Math.max(2, Math.min(10, action.value)) };
    case "setFilling":
      if (state.phase !== "plan") return state;
      return { ...state, filling: action.value };
    case "buySalsa":
      if (state.phase !== "plan" || state.salsaLevel >= 3 || state.cash < SALSA_COST) return state;
      return { ...state, cash: state.cash - SALSA_COST, salsaLevel: state.salsaLevel + 1 };
    case "buyLocation":
      if (state.phase !== "plan" || state.locationLevel >= 3 || state.cash < LOCATION_COST) return state;
      return { ...state, cash: state.cash - LOCATION_COST, locationLevel: state.locationLevel + 1 };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sold = calcSold(state.tacoCount, state.tacoPrice, state.filling, state.salsaLevel, state.locationLevel, rng);
      const revenue = sold * state.tacoPrice;
      const waste = state.tacoCount - sold;
      const costPerTaco = FILLINGS[state.filling].cost;
      const cost = Math.round(state.tacoCount * costPerTaco + waste * 0.1);
      const profit = revenue - cost;
      const log = `Day ${state.day}: Made ${state.tacoCount} ${FILLINGS[state.filling].label} tacos, sold ${sold} @ $${state.tacoPrice} → ${profit >= 0 ? "+" : ""}$${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        lastSold: sold,
        lastRevenue: revenue,
        lastCost: cost,
        lastProfit: profit,
        log: [...state.log, log],
      };
    }

    case "nextDay": {
      if (state.phase !== "results") return state;
      if (state.day >= TOTAL_DAYS) return { ...state, phase: "done" };
      return { ...state, day: state.day + 1, phase: "plan" };
    }
  }
}

export function isTerminal(state: TacoState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 1500) * 100))) };
}
