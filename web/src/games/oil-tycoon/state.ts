import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_QUARTERS = 20;

export type Phase = "plan" | "results" | "done";

export interface OilState {
  rngSeed: number;
  quarter: number;
  cash: number;
  phase: Phase;
  wells: number;            // active oil wells (1-8)
  refinery: number;         // refinement level 0-3 ($150 each)
  sellPrice: number;        // price per barrel to sell at ($20-$100)
  prospecting: boolean;     // pay $100 to prospect new well this quarter
  barrelsSold: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  marketPrice: number;      // current market price per barrel
  log: readonly string[];
}

export type OilAction =
  | { type: "setSellPrice"; value: number }
  | { type: "toggleProspect" }
  | { type: "upgradeRefinery" }
  | { type: "pump" }
  | { type: "nextQuarter" };

const WELL_CAPACITY = 300;    // barrels per quarter per well (base)
const DRILL_COST = 200;       // cost to drill a new well from prospecting
const REFINERY_COST = 150;
const PROSPECT_COST = 100;
const WELL_OPERATING_COST = 80;  // per well per quarter

export { DRILL_COST, REFINERY_COST, PROSPECT_COST };

export function initialState(seed: number): OilState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    quarter: 1,
    cash: 800,
    phase: "plan",
    wells: 2,
    refinery: 0,
    sellPrice: 60,
    prospecting: false,
    barrelsSold: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    marketPrice: 60,
    log: [],
  };
}

export function reducer(state: OilState, action: OilAction): OilState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setSellPrice":
      if (state.phase !== "plan") return state;
      return { ...state, sellPrice: Math.max(20, Math.min(100, action.value)) };
    case "toggleProspect":
      if (state.phase !== "plan") return state;
      if (state.prospecting) return { ...state, prospecting: false, cash: state.cash + PROSPECT_COST };
      if (state.cash < PROSPECT_COST) return state;
      return { ...state, prospecting: true, cash: state.cash - PROSPECT_COST };
    case "upgradeRefinery":
      if (state.phase !== "plan" || state.refinery >= 3 || state.cash < REFINERY_COST) return state;
      return { ...state, refinery: state.refinery + 1, cash: state.cash - REFINERY_COST };

    case "pump": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);

      // Market price fluctuates ±30%
      const priceNoise = 0.7 + rng() * 0.6;
      const newMarketPrice = Math.round(Math.max(20, Math.min(120, state.marketPrice * priceNoise + (rng() > 0.5 ? 5 : -5))));

      // Production
      const refineryBoost = 1 + state.refinery * 0.15;
      const barrelsProduced = Math.round(state.wells * WELL_CAPACITY * refineryBoost * (0.8 + rng() * 0.4));

      // Demand for your price (vs market)
      const priceFactor = state.sellPrice <= newMarketPrice
        ? 1.0
        : Math.max(0, 1 - (state.sellPrice - newMarketPrice) / newMarketPrice);
      const barrelsSold = Math.round(barrelsProduced * priceFactor);

      const revenue = barrelsSold * state.sellPrice;
      const operatingCost = state.wells * WELL_OPERATING_COST;
      const cost = operatingCost;
      const profit = revenue - cost;

      // Prospecting: 50% chance of finding a new well
      let newWells = state.wells;
      if (state.prospecting && rng() > 0.5 && state.wells < 8) {
        newWells = state.wells + 1;
      }

      const wellNote = newWells > state.wells ? " ⛽ New well struck!" : "";
      const log = `Q${state.quarter}: ${barrelsSold} barrels @ $${state.sellPrice} (market $${newMarketPrice}) → ${profit >= 0 ? "+" : ""}$${profit}${wellNote}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        wells: newWells,
        barrelsSold,
        lastRevenue: revenue,
        lastCost: cost,
        lastProfit: profit,
        marketPrice: newMarketPrice,
        prospecting: false,
        log: [...state.log, log],
      };
    }

    case "nextQuarter": {
      if (state.phase !== "results") return state;
      if (state.quarter >= TOTAL_QUARTERS) return { ...state, phase: "done" };
      return { ...state, quarter: state.quarter + 1, phase: "plan" };
    }
  }
}

export function isTerminal(state: OilState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 8000) * 100))) };
}
