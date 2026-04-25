import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_JUMPS = 15;

export type Good = "food" | "tech" | "ore" | "medicine";
export type Phase = "port" | "travel" | "done";

export interface SpaceTraderState {
  rngSeed: number;
  jump: number;
  credits: number;
  fuel: number;
  cargo: Record<Good, number>;
  prices: Record<Good, number>;
  planet: string;
  phase: Phase;
  log: readonly string[];
}

export type SpaceTraderAction =
  | { type: "buy"; good: Good; qty: number }
  | { type: "sell"; good: Good; qty: number }
  | { type: "jump" }
  | { type: "refuel" };

export const GOODS: Record<Good, { label: string; basePrice: number; variance: number }> = {
  food:     { label: "Food",     basePrice: 10, variance: 5 },
  tech:     { label: "Tech",     basePrice: 50, variance: 20 },
  ore:      { label: "Ore",      basePrice: 25, variance: 12 },
  medicine: { label: "Medicine", basePrice: 35, variance: 15 },
};

const PLANETS = ["Terra", "Vega", "Kron", "Nexus", "Orbit", "Zephyr", "Dune", "Lyra"];
const MAX_CARGO = 20;
const FUEL_PER_JUMP = 3;
const REFUEL_COST = 30;
const MAX_FUEL = 15;

function makePrices(rng: () => number): Record<Good, number> {
  const goods = Object.keys(GOODS) as Good[];
  const out = {} as Record<Good, number>;
  for (const g of goods) {
    const info = GOODS[g];
    out[g] = Math.max(1, Math.round(info.basePrice + (rng() - 0.5) * 2 * info.variance));
  }
  return out;
}

export function cargoTotal(cargo: Record<Good, number>): number {
  return Object.values(cargo).reduce((a, b) => a + b, 0);
}

export function initialState(seed: number): SpaceTraderState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const prices = makePrices(rng2);
  return {
    rngSeed: nextSeed,
    jump: 0,
    credits: 200,
    fuel: MAX_FUEL,
    cargo: { food: 0, tech: 0, ore: 0, medicine: 0 },
    prices,
    planet: PLANETS[0] ?? "Terra",
    phase: "port",
    log: ["Welcome to Terra. Trade wisely across the galaxy!"],
  };
}

export function reducer(state: SpaceTraderState, action: SpaceTraderAction): SpaceTraderState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "buy": {
      if (state.phase !== "port") return state;
      const price = state.prices[action.good];
      const cost = price * action.qty;
      const newTotal = cargoTotal(state.cargo) + action.qty;
      if (state.credits < cost || newTotal > MAX_CARGO || action.qty < 1) return state;
      return {
        ...state,
        credits: state.credits - cost,
        cargo: { ...state.cargo, [action.good]: state.cargo[action.good] + action.qty },
      };
    }

    case "sell": {
      if (state.phase !== "port") return state;
      if (state.cargo[action.good] < action.qty || action.qty < 1) return state;
      const earned = state.prices[action.good] * action.qty;
      const log = `Sold ${action.qty} ${GOODS[action.good].label} for $${earned}.`;
      return {
        ...state,
        credits: state.credits + earned,
        cargo: { ...state.cargo, [action.good]: state.cargo[action.good] - action.qty },
        log: [...state.log, log],
      };
    }

    case "refuel": {
      if (state.phase !== "port" || state.credits < REFUEL_COST) return state;
      return { ...state, credits: state.credits - REFUEL_COST, fuel: MAX_FUEL };
    }

    case "jump": {
      if (state.phase !== "port" || state.fuel < FUEL_PER_JUMP) return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const prices = makePrices(rng2);
      const newJump = state.jump + 1;
      const planetIdx = Math.floor(rng() * PLANETS.length);
      const planet: string = PLANETS[planetIdx] ?? "Nexus";
      if (newJump >= TOTAL_JUMPS) {
        return {
          ...state,
          rngSeed: nextSeed,
          jump: newJump,
          fuel: state.fuel - FUEL_PER_JUMP,
          prices,
          planet,
          phase: "done",
          log: [...state.log, `Arrived at ${planet}. Journey complete!`],
        };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        jump: newJump,
        fuel: state.fuel - FUEL_PER_JUMP,
        prices,
        planet,
        phase: "port",
        log: [...state.log, `Jumped to ${planet}. Fuel: ${state.fuel - FUEL_PER_JUMP}.`],
      };
    }
  }
}

export function isTerminal(state: SpaceTraderState): { score: number } | null {
  if (state.phase !== "done") return null;
  const cargoValue = (Object.keys(state.cargo) as Good[]).reduce(
    (sum, g) => sum + state.cargo[g] * GOODS[g].basePrice, 0
  );
  const total = state.credits + cargoValue;
  return { score: Math.max(0, Math.min(100, Math.round((total / 800) * 100))) };
}
