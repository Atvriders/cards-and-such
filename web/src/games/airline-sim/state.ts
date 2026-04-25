import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_QUARTERS = 16; // 4 years of quarters

export type Route = "domestic" | "regional" | "international";
export type Phase = "plan" | "results" | "done";

export interface AirlineState {
  rngSeed: number;
  quarter: number;
  cash: number;
  phase: Phase;
  fleet: number;          // number of planes (1-8)
  ticketPrice: number;    // per seat $50-$400
  activeRoute: Route;
  fuelHedged: boolean;    // pay $80 upfront to hedge fuel costs
  maintenanceLevel: number; // 0-3 upgrades ($120 each)
  lastFlights: number;    // flights run
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  safetyRating: number;   // 0-100
  log: readonly string[];
}

export type AirlineAction =
  | { type: "setPrice"; value: number }
  | { type: "setRoute"; value: Route }
  | { type: "buyPlane" }
  | { type: "toggleFuelHedge" }
  | { type: "upgradeMaintenance" }
  | { type: "fly" }
  | { type: "nextQuarter" };

export const ROUTES: Record<Route, { label: string; seatsPerFlight: number; baseDemandFactor: number; costPerFlight: number }> = {
  domestic:      { label: "Domestic",      seatsPerFlight: 120, baseDemandFactor: 1.0, costPerFlight: 400 },
  regional:      { label: "Regional",      seatsPerFlight: 80,  baseDemandFactor: 0.9, costPerFlight: 250 },
  international: { label: "International", seatsPerFlight: 200, baseDemandFactor: 0.7, costPerFlight: 900 },
};

export const PLANE_COST = 500;
export const MAINTENANCE_COST = 120;
export const FUEL_HEDGE_COST = 80;

export function initialState(seed: number): AirlineState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    quarter: 1,
    cash: 1000,
    phase: "plan",
    fleet: 2,
    ticketPrice: 150,
    activeRoute: "domestic",
    fuelHedged: false,
    maintenanceLevel: 0,
    lastFlights: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    safetyRating: 70,
    log: [],
  };
}

export function calcPassengers(
  fleet: number,
  price: number,
  route: Route,
  maintenance: number,
  safety: number,
  rng: () => number,
): number {
  const routeInfo = ROUTES[route];
  const maxCapacity = fleet * routeInfo.seatsPerFlight * 45; // 45 flights per plane per quarter
  const priceEffect = Math.max(0, 1 - (price - 50) / 700);
  const safetyBoost = 0.7 + (safety / 100) * 0.5;
  const maintenanceBoost = 1 + maintenance * 0.08;
  const demand = maxCapacity * routeInfo.baseDemandFactor * priceEffect * safetyBoost * maintenanceBoost;
  const noise = 0.8 + rng() * 0.4;
  return Math.min(maxCapacity, Math.max(0, Math.round(demand * noise)));
}

export function reducer(state: AirlineState, action: AirlineAction): AirlineState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, ticketPrice: Math.max(50, Math.min(400, action.value)) };
    case "setRoute":
      if (state.phase !== "plan") return state;
      return { ...state, activeRoute: action.value };
    case "buyPlane":
      if (state.phase !== "plan" || state.fleet >= 8 || state.cash < PLANE_COST) return state;
      return { ...state, fleet: state.fleet + 1, cash: state.cash - PLANE_COST };
    case "toggleFuelHedge":
      if (state.phase !== "plan") return state;
      if (state.fuelHedged) return { ...state, fuelHedged: false, cash: state.cash + FUEL_HEDGE_COST };
      if (state.cash < FUEL_HEDGE_COST) return state;
      return { ...state, fuelHedged: true, cash: state.cash - FUEL_HEDGE_COST };
    case "upgradeMaintenance":
      if (state.phase !== "plan" || state.maintenanceLevel >= 3 || state.cash < MAINTENANCE_COST) return state;
      return { ...state, maintenanceLevel: state.maintenanceLevel + 1, cash: state.cash - MAINTENANCE_COST };

    case "fly": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const routeInfo = ROUTES[state.activeRoute];
      const totalFlights = state.fleet * 45;
      const passengers = calcPassengers(state.fleet, state.ticketPrice, state.activeRoute, state.maintenanceLevel, state.safetyRating, rng);
      const revenue = passengers * state.ticketPrice;
      // Fuel is expensive if not hedged (random spike possible)
      const fuelRollRaw = rng();
      const fuelRoll = state.fuelHedged ? 0 : fuelRollRaw;
      const fuelSpike = fuelRoll > 0.7 ? 1.4 : 1.0;
      const flightCosts = totalFlights * routeInfo.costPerFlight * fuelSpike;
      const maintenanceSaving = state.maintenanceLevel * 0.05;
      const totalCost = Math.round(flightCosts * (1 - maintenanceSaving));
      const profit = revenue - totalCost;
      // Safety degrades without maintenance
      const safetyDelta = state.maintenanceLevel >= 2 ? 2 : state.maintenanceLevel >= 1 ? 0 : -3;
      const newSafety = Math.max(20, Math.min(100, state.safetyRating + safetyDelta));
      const fuelNote = fuelSpike > 1 ? " ⚠️ Fuel spike!" : "";
      const log = `Q${state.quarter}: ${passengers.toLocaleString()} pax, ${totalFlights} flights → ${profit >= 0 ? "+" : ""}$${profit}${fuelNote}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        lastFlights: totalFlights,
        lastRevenue: revenue,
        lastCost: totalCost,
        lastProfit: profit,
        safetyRating: newSafety,
        fuelHedged: false, // resets each quarter
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

export function isTerminal(state: AirlineState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 10000) * 100))) };
}
