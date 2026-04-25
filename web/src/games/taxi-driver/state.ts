import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_SHIFTS = 20;

export type Zone = "downtown" | "airport" | "suburbs" | "harbor";
export type Phase = "pick" | "drive" | "done";

export interface TaxiState {
  rngSeed: number;
  shift: number;
  cash: number;
  fuel: number;
  phase: Phase;
  zone: Zone;
  fare: number;
  tip: number;
  fuelCost: number;
  log: readonly string[];
}

export type TaxiAction =
  | { type: "pickZone"; zone: Zone }
  | { type: "nextShift" }
  | { type: "refuel" };

export const ZONES: Record<Zone, { label: string; baseFare: number; fuelUse: number; tipChance: number }> = {
  downtown: { label: "Downtown",  baseFare: 8,  fuelUse: 2, tipChance: 0.4 },
  airport:  { label: "Airport",   baseFare: 20, fuelUse: 6, tipChance: 0.55 },
  suburbs:  { label: "Suburbs",   baseFare: 12, fuelUse: 4, tipChance: 0.35 },
  harbor:   { label: "Harbor",    baseFare: 10, fuelUse: 3, tipChance: 0.45 },
};

export const REFUEL_COST = 15;
export const MAX_FUEL = 20;

export function initialState(seed: number): TaxiState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    shift: 1,
    cash: 50,
    fuel: MAX_FUEL,
    phase: "pick",
    zone: "downtown",
    fare: 0,
    tip: 0,
    fuelCost: 0,
    log: [],
  };
}

export function reducer(state: TaxiState, action: TaxiAction): TaxiState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "pickZone": {
      if (state.phase !== "pick") return state;
      const info = ZONES[action.zone];
      if (state.fuel < info.fuelUse) return state; // not enough fuel
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const noShow = rng() < 0.1; // 10% chance no passenger
      if (noShow) {
        const fuelLeft = state.fuel - info.fuelUse;
        const log = `Shift ${state.shift}: No passenger in ${info.label}. Fuel -${info.fuelUse}.`;
        return {
          ...state,
          rngSeed: nextSeed,
          fuel: fuelLeft,
          fare: 0,
          tip: 0,
          fuelCost: info.fuelUse,
          zone: action.zone,
          phase: "drive",
          log: [...state.log, log],
        };
      }
      const fareVariance = 0.8 + rng() * 0.5;
      const fare = Math.round(info.baseFare * fareVariance);
      const hasTip = rng() < info.tipChance;
      const tip = hasTip ? Math.round(fare * (0.1 + rng() * 0.2)) : 0;
      const fuelLeft = state.fuel - info.fuelUse;
      const earned = fare + tip;
      const log = `Shift ${state.shift}: ${info.label} → $${fare} fare${tip > 0 ? ` + $${tip} tip` : ""}.`;
      return {
        ...state,
        rngSeed: nextSeed,
        cash: state.cash + earned,
        fuel: fuelLeft,
        fare,
        tip,
        fuelCost: info.fuelUse,
        zone: action.zone,
        phase: "drive",
        log: [...state.log, log],
      };
    }

    case "refuel": {
      if (state.phase !== "pick") return state;
      if (state.cash < REFUEL_COST) return state;
      return {
        ...state,
        cash: state.cash - REFUEL_COST,
        fuel: MAX_FUEL,
      };
    }

    case "nextShift": {
      if (state.phase !== "drive") return state;
      if (state.shift >= TOTAL_SHIFTS) return { ...state, phase: "done" };
      return { ...state, shift: state.shift + 1, phase: "pick" };
    }
  }
}

export function isTerminal(state: TaxiState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 400) * 100))) };
}
