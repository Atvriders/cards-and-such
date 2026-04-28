import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TARGET_VALUATION = 1_000_000;
export const MAX_TURNS = 30;

export interface StartupSettings { dummy: boolean; }
export interface StartupState {
  rngSeed: number;
  cash: number;
  hires: number;
  product: number; // milestones reached 0..10
  valuation: number;
  turn: number;
  lastEvent: string | null;
  phase: "rolling" | "resolved" | "done";
}
export type StartupAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _s: StartupSettings): StartupState {
  return { rngSeed: seed, cash: 50_000, hires: 1, product: 0, valuation: 50_000, turn: 1, lastEvent: null, phase: "rolling" };
}

export function reducer(state: StartupState, action: StartupAction): StartupState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let cash = state.cash, hires = state.hires, product = state.product, evt = "";
    // Each roll triggers an event tied to the dice
    if (r === 1) { cash -= 5_000 * hires; evt = `Burn rate: -$${5_000 * hires} (payroll)`; }
    else if (r === 2) { hires += 1; cash -= 10_000; evt = "Hired engineer (-$10k, +1 hire)"; }
    else if (r === 3) { product = Math.min(10, product + 1); evt = "Product milestone! +1"; }
    else if (r === 4) { cash += 25_000 * hires; evt = `Revenue: +$${25_000 * hires}`; }
    else if (r === 5) { cash += 100_000; evt = "Funding round! +$100k"; }
    else if (r === 6) { cash += 250_000; product = Math.min(10, product + 2); evt = "Series A! +$250k, +2 product"; }
    // Valuation = cash + 50k * hires + 100k * product
    const valuation = Math.max(0, cash) + 50_000 * hires + 100_000 * product;
    const reachedIPO = valuation >= TARGET_VALUATION;
    const broke = cash <= -100_000;
    const isLast = state.turn >= MAX_TURNS;
    const done = reachedIPO || broke || isLast;
    return { ...state, rngSeed: nextSeed, cash, hires, product, valuation, lastEvent: evt, phase: done ? "done" : "resolved" };
  }
  if (action.type === "next" && state.phase === "resolved") {
    return { ...state, turn: state.turn + 1, phase: "rolling", lastEvent: null };
  }
  return state;
}

export function score(s: StartupState): number {
  // Reaching IPO = big bonus; else valuation/1000
  const ipoBonus = s.valuation >= TARGET_VALUATION ? 1000 : 0;
  return Math.max(0, ipoBonus + Math.floor(s.valuation / 1000));
}
export function isTerminal(s: StartupState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
