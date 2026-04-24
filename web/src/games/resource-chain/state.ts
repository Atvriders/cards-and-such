import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 20;

export type Resource = "seeds" | "crops" | "flour" | "bread";

export interface ResourceChainState {
  rngSeed: number;
  turn: number;
  coins: number;
  resources: Record<Resource, number>;
  phase: "action" | "market" | "done";
  lastEarned: number;
  demandMultiplier: number; // bread demand this turn
  log: readonly string[];
}

export type ResourceChainAction =
  | { type: "buy"; resource: "seeds"; qty: number }
  | { type: "process"; from: Resource; qty: number }
  | { type: "sell"; qty: number }
  | { type: "endTurn" };

// Costs and processing chain: seeds->crops->flour->bread
export const PRICES = {
  seeds: { buy: 5 },
  crops: { processFrom: "seeds" as Resource, ratio: 2 }, // 1 seed -> 2 crops
  flour: { processFrom: "crops" as Resource, ratio: 1 }, // 2 crops -> 1 flour
  bread: { processFrom: "flour" as Resource, ratio: 1, baseSell: 20 }, // 1 flour -> 1 bread
};

export function initialState(seed: number): ResourceChainState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    turn: 1,
    coins: 50,
    resources: { seeds: 0, crops: 0, flour: 0, bread: 0 },
    phase: "action",
    lastEarned: 0,
    demandMultiplier: 1.0,
    log: [],
  };
}

export function reducer(state: ResourceChainState, action: ResourceChainAction): ResourceChainState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "buy": {
      if (state.phase !== "action") return state;
      const { qty } = action;
      if (qty <= 0) return state;
      const cost = PRICES.seeds.buy * qty;
      if (cost > state.coins) return state;
      return {
        ...state,
        coins: state.coins - cost,
        resources: { ...state.resources, seeds: state.resources.seeds + qty },
      };
    }

    case "process": {
      if (state.phase !== "action") return state;
      const { from, qty } = action;

      if (from === "seeds") {
        // seeds -> crops (1:2)
        if (state.resources.seeds < qty) return state;
        return {
          ...state,
          resources: {
            ...state.resources,
            seeds: state.resources.seeds - qty,
            crops: state.resources.crops + qty * 2,
          },
        };
      }
      if (from === "crops") {
        // crops -> flour (2:1)
        const pairs = Math.floor(qty / 2);
        if (pairs < 1 || state.resources.crops < pairs * 2) return state;
        return {
          ...state,
          resources: {
            ...state.resources,
            crops: state.resources.crops - pairs * 2,
            flour: state.resources.flour + pairs,
          },
        };
      }
      if (from === "flour") {
        // flour -> bread (1:1)
        if (state.resources.flour < qty) return state;
        return {
          ...state,
          resources: {
            ...state.resources,
            flour: state.resources.flour - qty,
            bread: state.resources.bread + qty,
          },
        };
      }
      return state;
    }

    case "sell": {
      if (state.phase !== "action") return state;
      const { qty } = action;
      if (qty <= 0 || state.resources.bread < qty) return state;
      const earned = Math.round(PRICES.bread.baseSell * state.demandMultiplier * qty);
      const logEntry = `Turn ${state.turn}: Sold ${qty} bread for ${earned} coins (demand x${state.demandMultiplier.toFixed(1)})`;
      return {
        ...state,
        coins: state.coins + earned,
        lastEarned: earned,
        resources: { ...state.resources, bread: state.resources.bread - qty },
        log: [...state.log, logEntry],
      };
    }

    case "endTurn": {
      if (state.phase !== "action") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const demand = 0.7 + rng() * 0.8; // 0.7..1.5
      const nextTurn = state.turn + 1;
      if (nextTurn > TOTAL_TURNS) {
        return { ...state, rngSeed: nextSeed, phase: "done" };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        turn: nextTurn,
        demandMultiplier: Math.round(demand * 10) / 10,
        lastEarned: 0,
      };
    }
  }
}

export function isTerminal(state: ResourceChainState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.coins / 400) * 100))) };
}
