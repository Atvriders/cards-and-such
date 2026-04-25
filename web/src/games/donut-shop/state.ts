import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 18;

export type DonutFlavor = "glazed" | "chocolate" | "sprinkles" | "fritter";
export type Phase = "plan" | "results" | "done";

export interface DonutState {
  rngSeed: number;
  day: number;
  cash: number;
  phase: Phase;
  dozenCount: number;   // dozens to bake 1-20
  donutPrice: number;   // price per dozen $4-18
  flavor: DonutFlavor;
  glazeLevel: number;   // 0-3 upgrade
  displayLevel: number; // 0-3 upgrade
  lastSold: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  log: readonly string[];
}

export type DonutAction =
  | { type: "setDozens"; value: number }
  | { type: "setPrice"; value: number }
  | { type: "setFlavor"; value: DonutFlavor }
  | { type: "buyGlaze" }
  | { type: "buyDisplay" }
  | { type: "openDay" }
  | { type: "nextDay" };

export const FLAVORS: Record<DonutFlavor, { label: string; cost: number; baseDemand: number }> = {
  glazed:    { label: "Glazed",    cost: 1.5, baseDemand: 12 },
  chocolate: { label: "Chocolate", cost: 2.0, baseDemand: 10 },
  sprinkles: { label: "Sprinkles", cost: 1.8, baseDemand: 11 },
  fritter:   { label: "Fritter",   cost: 2.5, baseDemand: 8  },
};

export const GLAZE_COST = 22;
export const DISPLAY_COST = 32;

export function initialState(seed: number): DonutState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    cash: 100,
    phase: "plan",
    dozenCount: 8,
    donutPrice: 8,
    flavor: "glazed",
    glazeLevel: 0,
    displayLevel: 0,
    lastSold: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    log: [],
  };
}

export function calcSold(
  dozens: number,
  price: number,
  flavor: DonutFlavor,
  glaze: number,
  display: number,
  rng: () => number,
): number {
  const info = FLAVORS[flavor];
  const glazeBoost = 1 + glaze * 0.15;
  const displayBoost = 1 + display * 0.2;
  const priceEffect = Math.max(0, 1 - (price - 4) / 28);
  const demand = info.baseDemand * priceEffect * glazeBoost * displayBoost;
  const want = Math.round(demand * (0.6 + rng() * 0.8));
  return Math.min(dozens, Math.max(0, want));
}

export function reducer(state: DonutState, action: DonutAction): DonutState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setDozens":
      if (state.phase !== "plan") return state;
      return { ...state, dozenCount: Math.max(1, Math.min(20, action.value)) };
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, donutPrice: Math.max(4, Math.min(18, action.value)) };
    case "setFlavor":
      if (state.phase !== "plan") return state;
      return { ...state, flavor: action.value };
    case "buyGlaze":
      if (state.phase !== "plan" || state.glazeLevel >= 3 || state.cash < GLAZE_COST) return state;
      return { ...state, cash: state.cash - GLAZE_COST, glazeLevel: state.glazeLevel + 1 };
    case "buyDisplay":
      if (state.phase !== "plan" || state.displayLevel >= 3 || state.cash < DISPLAY_COST) return state;
      return { ...state, cash: state.cash - DISPLAY_COST, displayLevel: state.displayLevel + 1 };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sold = calcSold(state.dozenCount, state.donutPrice, state.flavor, state.glazeLevel, state.displayLevel, rng);
      const revenue = sold * state.donutPrice;
      const waste = state.dozenCount - sold;
      const cost = Math.round(state.dozenCount * FLAVORS[state.flavor].cost + waste * 0.5);
      const profit = revenue - cost;
      const log = `Day ${state.day}: Baked ${state.dozenCount}dz ${FLAVORS[state.flavor].label}, sold ${sold}dz @ $${state.donutPrice} → ${profit >= 0 ? "+" : ""}$${profit}`;
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

export function isTerminal(state: DonutState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 1200) * 100))) };
}
