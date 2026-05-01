import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const STOPS = 6;
export const STARTING_GOODS = 8;

export interface DiceTradeRouteSettings { dummy: boolean; }

export interface DiceTradeRouteState {
  rngSeed: number;
  stop: number;
  goods: number;
  rolls: [number, number] | null;
  prices: number[];
  score: number;
  phase: "trade" | "result" | "done";
  log: string;
}

export type DiceTradeRouteAction = { type: "sell"; amount: number } | { type: "next" };

function genPrices(rng: () => number): number[] {
  return Array.from({ length: STOPS }, () => 2 + Math.floor(rng() * 8));
}

export function initialState(seed: number, _settings: DiceTradeRouteSettings): DiceTradeRouteState {
  const rng = mulberry32(seed);
  const prices = genPrices(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, stop: 0, goods: STARTING_GOODS, rolls: null, prices, score: 0, phase: "trade", log: "" };
}

export function reducer(state: DiceTradeRouteState, action: DiceTradeRouteAction): DiceTradeRouteState {
  if (state.phase === "done") return state;
  if (action.type === "sell" && state.phase === "trade") {
    const sell = Math.max(0, Math.min(action.amount, state.goods));
    const price = state.prices[state.stop] ?? 0;
    const earned = sell * price;
    return { ...state, goods: state.goods - sell, score: state.score + earned, phase: "result", log: `Sold ${sell} at ${price}g each = +${earned}.` };
  }
  if (action.type === "next" && state.phase === "result") {
    if (state.stop + 1 >= STOPS) return { ...state, phase: "done", log: "Caravan home." };
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng()*6);
    const r2 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let log = `Travel to next city. Dice ${r1}, ${r2}.`;
    if (r1 === 1 && r2 === 1) {
      // bandits
      const stolen = Math.min(state.goods, 3);
      return { ...state, rngSeed: nextSeed, stop: state.stop + 1, goods: state.goods - stolen, rolls: [r1, r2], phase: "trade", log: log + ` Bandits stole ${stolen} goods!` };
    }
    return { ...state, rngSeed: nextSeed, stop: state.stop + 1, rolls: [r1, r2], phase: "trade", log };
  }
  return state;
}

export function isTerminal(state: DiceTradeRouteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
