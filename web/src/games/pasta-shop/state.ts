import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 22;

export type PastaType = "spaghetti" | "fettuccine" | "penne" | "ravioli";
export type Phase = "plan" | "results" | "done";

export interface PastaState {
  rngSeed: number;
  day: number;
  cash: number;
  phase: Phase;
  batchSize: number;    // portions 1-70
  portionPrice: number; // $3-14
  pasta: PastaType;
  sauceLevel: number;   // 0-3 upgrade
  marketingLevel: number; // 0-3 upgrade
  lastSold: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  log: readonly string[];
}

export type PastaAction =
  | { type: "setBatch"; value: number }
  | { type: "setPrice"; value: number }
  | { type: "setPasta"; value: PastaType }
  | { type: "buySauce" }
  | { type: "buyMarketing" }
  | { type: "openDay" }
  | { type: "nextDay" };

export const PASTAS: Record<PastaType, { label: string; cost: number; baseDemand: number }> = {
  spaghetti:  { label: "Spaghetti",  cost: 0.7, baseDemand: 30 },
  fettuccine: { label: "Fettuccine", cost: 0.9, baseDemand: 24 },
  penne:      { label: "Penne",      cost: 0.6, baseDemand: 26 },
  ravioli:    { label: "Ravioli",    cost: 1.3, baseDemand: 18 },
};

export const SAUCE_COST = 28;
export const MARKETING_COST = 35;

export function initialState(seed: number): PastaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    cash: 130,
    phase: "plan",
    batchSize: 28,
    portionPrice: 6,
    pasta: "spaghetti",
    sauceLevel: 0,
    marketingLevel: 0,
    lastSold: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    log: [],
  };
}

export function calcSold(
  batch: number,
  price: number,
  pasta: PastaType,
  sauce: number,
  marketing: number,
  rng: () => number,
): number {
  const info = PASTAS[pasta];
  const sauceBoost = 1 + sauce * 0.14;
  const marketingBoost = 1 + marketing * 0.16;
  const priceEffect = Math.max(0, 1 - (price - 3) / 22);
  const demand = info.baseDemand * priceEffect * sauceBoost * marketingBoost;
  const want = Math.round(demand * (0.65 + rng() * 0.7));
  return Math.min(batch, Math.max(0, want));
}

export function reducer(state: PastaState, action: PastaAction): PastaState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setBatch":
      if (state.phase !== "plan") return state;
      return { ...state, batchSize: Math.max(1, Math.min(70, action.value)) };
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, portionPrice: Math.max(3, Math.min(14, action.value)) };
    case "setPasta":
      if (state.phase !== "plan") return state;
      return { ...state, pasta: action.value };
    case "buySauce":
      if (state.phase !== "plan" || state.sauceLevel >= 3 || state.cash < SAUCE_COST) return state;
      return { ...state, cash: state.cash - SAUCE_COST, sauceLevel: state.sauceLevel + 1 };
    case "buyMarketing":
      if (state.phase !== "plan" || state.marketingLevel >= 3 || state.cash < MARKETING_COST) return state;
      return { ...state, cash: state.cash - MARKETING_COST, marketingLevel: state.marketingLevel + 1 };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sold = calcSold(state.batchSize, state.portionPrice, state.pasta, state.sauceLevel, state.marketingLevel, rng);
      const revenue = sold * state.portionPrice;
      const waste = state.batchSize - sold;
      const cost = Math.round(state.batchSize * PASTAS[state.pasta].cost + waste * 0.15);
      const profit = revenue - cost;
      const log = `Day ${state.day}: ${PASTAS[state.pasta].label} ×${state.batchSize}, sold ${sold} @ $${state.portionPrice} → ${profit >= 0 ? "+" : ""}$${profit}`;
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

export function isTerminal(state: PastaState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 1800) * 100))) };
}
