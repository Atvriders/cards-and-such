import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Craps Light: 10 rounds. Bet pass or don't pass on come-out roll only.
// Pass: 7 or 11 win (+10), 2/3/12 lose (0). Others push (0).
// Don't pass: 2 or 3 win (+10), 7 or 11 lose (0), 12 push, others push (0).
export const TOTAL_ROUNDS = 10;
export interface CrapsLightSettings { dummy: boolean; }
export type Bet = "pass" | "dont";
export interface CrapsLightState { rngSeed: number; round: number; dice: [number, number] | null; bet: Bet | null; outcome: "win" | "lose" | "push" | null; score: number; phase: "betting" | "result" | "done"; }
export type CrapsLightAction = { type: "bet"; bet: Bet } | { type: "next" };
export function initialState(seed: number, _s: CrapsLightSettings): CrapsLightState {
  return { rngSeed: seed, round: 1, dice: null, bet: null, outcome: null, score: 0, phase: "betting" };
}
export function reducer(state: CrapsLightState, action: CrapsLightAction): CrapsLightState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    let outcome: "win" | "lose" | "push" = "push";
    if (action.bet === "pass") {
      if (sum === 7 || sum === 11) outcome = "win";
      else if (sum === 2 || sum === 3 || sum === 12) outcome = "lose";
      else outcome = "push";
    } else {
      if (sum === 2 || sum === 3) outcome = "win";
      else if (sum === 7 || sum === 11) outcome = "lose";
      else outcome = "push";
    }
    const pts = outcome === "win" ? 10 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], bet: action.bet, outcome, score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: null, bet: null, outcome: null, phase: "betting" };
  }
  return state;
}
export function isTerminal(state: CrapsLightState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
