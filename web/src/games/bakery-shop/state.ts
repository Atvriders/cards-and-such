import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 25;

export type Item = "croissant" | "muffin" | "cake" | "bread" | "donut";
export type Phase = "plan" | "results" | "done";

export interface BakeryState {
  rngSeed: number;
  day: number;
  cash: number;
  phase: Phase;
  bake: Record<Item, number>;   // how many of each item to bake
  price: Record<Item, number>;  // price per item
  featured: Item;
  ovenLevel: number;   // 0-3 upgrades ($60 each), boosts capacity
  lastSoldMap: Record<Item, number>;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  log: readonly string[];
}

export type BakeryAction =
  | { type: "setBake"; item: Item; value: number }
  | { type: "setPrice"; item: Item; value: number }
  | { type: "setFeatured"; value: Item }
  | { type: "upgradeOven" }
  | { type: "openDay" }
  | { type: "nextDay" };

export const ITEMS: Record<Item, { label: string; costPerUnit: number; baseDemand: number; maxPrice: number }> = {
  croissant: { label: "Croissant", costPerUnit: 0.8,  baseDemand: 22, maxPrice: 8 },
  muffin:    { label: "Muffin",    costPerUnit: 0.5,  baseDemand: 28, maxPrice: 6 },
  cake:      { label: "Cake",      costPerUnit: 4.0,  baseDemand: 8,  maxPrice: 20 },
  bread:     { label: "Bread",     costPerUnit: 0.6,  baseDemand: 35, maxPrice: 7 },
  donut:     { label: "Donut",     costPerUnit: 0.4,  baseDemand: 30, maxPrice: 5 },
};

export const OVEN_UPGRADE_COST = 60;
export const MAX_TOTAL_BAKE = 100; // base capacity per day

function makeDefaultBake(): Record<Item, number> {
  return { croissant: 10, muffin: 10, cake: 3, bread: 10, donut: 10 };
}
function makeDefaultPrice(): Record<Item, number> {
  return { croissant: 3, muffin: 2, cake: 12, bread: 3, donut: 2 };
}

export function initialState(seed: number): BakeryState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    cash: 200,
    phase: "plan",
    bake: makeDefaultBake(),
    price: makeDefaultPrice(),
    featured: "croissant",
    ovenLevel: 0,
    lastSoldMap: { croissant: 0, muffin: 0, cake: 0, bread: 0, donut: 0 },
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    log: [],
  };
}

export function calcSoldForItem(
  baked: number,
  price: number,
  item: Item,
  isFeatured: boolean,
  rng: () => number,
): number {
  const info = ITEMS[item];
  const priceEffect = Math.max(0, 1 - (price - 1) / (info.maxPrice * 1.5));
  const featuredBoost = isFeatured ? 1.25 : 1.0;
  const demand = info.baseDemand * priceEffect * featuredBoost;
  const noise = 0.7 + rng() * 0.6;
  return Math.min(baked, Math.max(0, Math.round(demand * noise)));
}

export function totalBake(bake: Record<Item, number>): number {
  return Object.values(bake).reduce((a, b) => a + b, 0);
}

export function reducer(state: BakeryState, action: BakeryAction): BakeryState {
  if (state.phase === "done") return state;

  const capacity = MAX_TOTAL_BAKE + state.ovenLevel * 20;

  switch (action.type) {
    case "setBake": {
      if (state.phase !== "plan") return state;
      const newBake = { ...state.bake, [action.item]: Math.max(0, Math.min(50, action.value)) };
      if (totalBake(newBake) > capacity) return state; // over capacity
      return { ...state, bake: newBake };
    }
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, price: { ...state.price, [action.item]: Math.max(1, Math.min(ITEMS[action.item].maxPrice, action.value)) } };
    case "setFeatured":
      if (state.phase !== "plan") return state;
      return { ...state, featured: action.value };
    case "upgradeOven":
      if (state.phase !== "plan" || state.ovenLevel >= 3 || state.cash < OVEN_UPGRADE_COST) return state;
      return { ...state, ovenLevel: state.ovenLevel + 1, cash: state.cash - OVEN_UPGRADE_COST };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const soldMap: Record<Item, number> = { croissant: 0, muffin: 0, cake: 0, bread: 0, donut: 0 };
      let revenue = 0;
      let cost = 0;
      const items = Object.keys(ITEMS) as Item[];
      for (const item of items) {
        const baked = state.bake[item];
        const p = state.price[item];
        const sold = calcSoldForItem(baked, p, item, state.featured === item, rng);
        soldMap[item] = sold;
        revenue += sold * p;
        cost += Math.round(baked * ITEMS[item].costPerUnit);
      }
      const profit = revenue - cost;
      const topItem = items.reduce((a, b) => soldMap[a] > soldMap[b] ? a : b);
      const log = `Day ${state.day}: ${ITEMS[topItem].label} top seller (${soldMap[topItem]}) → ${profit >= 0 ? "+" : ""}$${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        lastSoldMap: soldMap,
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

export function isTerminal(state: BakeryState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 1500) * 100))) };
}
