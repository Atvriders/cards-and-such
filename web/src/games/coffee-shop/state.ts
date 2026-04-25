import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 28;

export type Drink = "espresso" | "latte" | "coldBrew" | "tea";
export type Phase = "plan" | "results" | "done";

export interface CoffeeState {
  rngSeed: number;
  day: number;
  cash: number;
  phase: Phase;
  batchSize: number;    // cups to prepare (1-80)
  drinkPrice: number;   // price per cup in dollars (2-12)
  featured: Drink;
  loyalty: number;      // loyalty program (0-3 tiers, each costs $30 to unlock)
  upgradeLevel: number; // equipment (0-3, costs $50 each to upgrade)
  lastSold: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  log: readonly string[];
}

export type CoffeeAction =
  | { type: "setBatch"; value: number }
  | { type: "setPrice"; value: number }
  | { type: "setDrink"; value: Drink }
  | { type: "buyLoyalty" }
  | { type: "buyUpgrade" }
  | { type: "openDay" }
  | { type: "nextDay" };

export const DRINKS: Record<Drink, { label: string; costPerCup: number; baseDemand: number }> = {
  espresso: { label: "Espresso",  costPerCup: 0.5, baseDemand: 20 },
  latte:    { label: "Latte",     costPerCup: 1.0, baseDemand: 30 },
  coldBrew: { label: "Cold Brew", costPerCup: 0.8, baseDemand: 25 },
  tea:      { label: "Tea",       costPerCup: 0.4, baseDemand: 18 },
};

export const LOYALTY_COST = 30;
export const UPGRADE_COST = 50;

export function initialState(seed: number): CoffeeState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    cash: 150,
    phase: "plan",
    batchSize: 30,
    drinkPrice: 4,
    featured: "latte",
    loyalty: 0,
    upgradeLevel: 0,
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
  drink: Drink,
  loyalty: number,
  upgrade: number,
  rng: () => number,
): number {
  const info = DRINKS[drink];
  const loyaltyBoost = 1 + loyalty * 0.15;
  const upgradeBoost = 1 + upgrade * 0.1;
  const priceEffect = Math.max(0, 1 - (price - 2) / 20);
  const demand = info.baseDemand * priceEffect * loyaltyBoost * upgradeBoost;
  const want = Math.round(demand * (0.7 + rng() * 0.6));
  return Math.min(batch, Math.max(0, want));
}

export function reducer(state: CoffeeState, action: CoffeeAction): CoffeeState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setBatch":
      if (state.phase !== "plan") return state;
      return { ...state, batchSize: Math.max(1, Math.min(80, action.value)) };
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, drinkPrice: Math.max(2, Math.min(12, action.value)) };
    case "setDrink":
      if (state.phase !== "plan") return state;
      return { ...state, featured: action.value };
    case "buyLoyalty":
      if (state.phase !== "plan" || state.loyalty >= 3 || state.cash < LOYALTY_COST) return state;
      return { ...state, cash: state.cash - LOYALTY_COST, loyalty: state.loyalty + 1 };
    case "buyUpgrade":
      if (state.phase !== "plan" || state.upgradeLevel >= 3 || state.cash < UPGRADE_COST) return state;
      return { ...state, cash: state.cash - UPGRADE_COST, upgradeLevel: state.upgradeLevel + 1 };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sold = calcSold(state.batchSize, state.drinkPrice, state.featured, state.loyalty, state.upgradeLevel, rng);
      const revenue = sold * state.drinkPrice;
      const wasteCups = state.batchSize - sold;
      const costPerCup = DRINKS[state.featured].costPerCup;
      const cost = Math.round(state.batchSize * costPerCup + wasteCups * 0.2);
      const profit = revenue - cost;
      const log = `Day ${state.day}: Made ${state.batchSize} ${DRINKS[state.featured].label}s, sold ${sold} @ $${state.drinkPrice} → ${profit >= 0 ? "+" : ""}$${profit}`;
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

export function isTerminal(state: CoffeeState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 2000) * 100))) };
}
