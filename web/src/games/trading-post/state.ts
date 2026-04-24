import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 10;

export type Good = "silk" | "spice" | "iron" | "grain" | "gems";

export interface TradingPostState {
  rngSeed: number;
  turn: number;
  gold: number;
  inventory: Record<Good, number>;
  prices: Record<Good, number>;
  phase: "buy" | "sell" | "event" | "done";
  eventMessage: string;
  log: readonly string[];
}

export type TradingPostAction =
  | { type: "buy"; good: Good; qty: number }
  | { type: "sell"; good: Good; qty: number }
  | { type: "endPhase" };

export const GOODS: Good[] = ["silk", "spice", "iron", "grain", "gems"];

export const BASE_PRICES: Record<Good, number> = {
  silk: 30, spice: 20, iron: 15, grain: 8, gems: 60,
};

const GOOD_LABELS: Record<Good, string> = {
  silk: "Silk", spice: "Spice", iron: "Iron", grain: "Grain", gems: "Gems",
};
export { GOOD_LABELS };

function generatePrices(rng: () => number): Record<Good, number> {
  const prices = {} as Record<Good, number>;
  for (const g of GOODS) {
    const factor = 0.6 + rng() * 0.8;
    prices[g] = Math.max(2, Math.round(BASE_PRICES[g] * factor));
  }
  return prices;
}

const EVENTS = [
  "Pirates raid the harbor! All silk prices drop 30%.",
  "A festival boosts spice demand — spice prices up 50%!",
  "Iron shortage — iron prices rise 40%!",
  "Bumper harvest — grain prices drop 20%.",
  "Gem trader arrives — gems worth 30% more!",
  "No unusual events this turn.",
  "No unusual events this turn.",
];

function applyEvent(prices: Record<Good, number>, event: string): Record<Good, number> {
  const p = { ...prices };
  if (event.includes("silk")) p.silk = Math.round(p.silk * 0.7);
  if (event.includes("spice")) p.spice = Math.round(p.spice * 1.5);
  if (event.includes("iron")) p.iron = Math.round(p.iron * 1.4);
  if (event.includes("grain")) p.grain = Math.round(p.grain * 0.8);
  if (event.includes("gem")) p.gems = Math.round(p.gems * 1.3);
  return p;
}

export function initialState(seed: number): TradingPostState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const prices = generatePrices(rng2);
  return {
    rngSeed: nextSeed,
    turn: 1,
    gold: 200,
    inventory: { silk: 0, spice: 0, iron: 0, grain: 0, gems: 0 },
    prices,
    phase: "buy",
    eventMessage: "",
    log: [],
  };
}

export function reducer(state: TradingPostState, action: TradingPostAction): TradingPostState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "buy": {
      if (state.phase !== "buy") return state;
      const { good, qty } = action;
      if (qty <= 0) return state;
      const cost = state.prices[good] * qty;
      if (cost > state.gold) return state;
      return {
        ...state,
        gold: state.gold - cost,
        inventory: { ...state.inventory, [good]: state.inventory[good] + qty },
      };
    }

    case "sell": {
      if (state.phase !== "sell") return state;
      const { good, qty } = action;
      if (qty <= 0 || state.inventory[good] < qty) return state;
      const earned = state.prices[good] * qty;
      const logEntry = `Turn ${state.turn}: Sold ${qty} ${GOOD_LABELS[good]} for ${earned}g`;
      return {
        ...state,
        gold: state.gold + earned,
        inventory: { ...state.inventory, [good]: state.inventory[good] - qty },
        log: [...state.log, logEntry],
      };
    }

    case "endPhase": {
      if (state.phase === "buy") {
        // Move to sell
        return { ...state, phase: "sell" };
      }
      if (state.phase === "sell") {
        // Generate event and new prices for next turn
        const rng = mulberry32(state.rngSeed);
        const nextSeed = Math.floor(rng() * 2 ** 31);
        const rng2 = mulberry32(nextSeed);
        const eventIdx = Math.floor(rng2() * EVENTS.length);
        const event = EVENTS[eventIdx]!;
        const rawPrices = generatePrices(rng2);
        const newPrices = applyEvent(rawPrices, event.toLowerCase());
        const nextTurn = state.turn + 1;
        if (nextTurn > TOTAL_TURNS) {
          return { ...state, rngSeed: nextSeed, phase: "done", eventMessage: event };
        }
        return {
          ...state,
          rngSeed: nextSeed,
          turn: nextTurn,
          prices: newPrices,
          phase: "buy",
          eventMessage: event,
        };
      }
      return state;
    }
  }
}

export function isTerminal(state: TradingPostState): { score: number } | null {
  if (state.phase !== "done") return null;
  const inventoryValue = GOODS.reduce((sum, g) => sum + state.inventory[g] * state.prices[g], 0);
  const total = state.gold + inventoryValue;
  return { score: Math.max(0, Math.min(100, Math.round((total / 800) * 100))) };
}
