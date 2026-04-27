import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Dice Duel: 10 rounds. You roll 3 dice, CPU rolls 3 dice. Higher sum wins (+10). Tie = no points.
export const TOTAL_ROUNDS = 10;
export interface DiceDuelSettings { dummy: boolean; }
export interface DiceDuelState { rngSeed: number; round: number; you: number[] | null; cpu: number[] | null; outcome: "win" | "lose" | "tie" | null; wins: number; score: number; phase: "ready" | "result" | "done"; }
export type DiceDuelAction = { type: "duel" } | { type: "next" };
export function initialState(seed: number, _s: DiceDuelSettings): DiceDuelState {
  return { rngSeed: seed, round: 1, you: null, cpu: null, outcome: null, wins: 0, score: 0, phase: "ready" };
}
function roll3(rng: () => number): number[] { return [0,0,0].map(() => 1 + Math.floor(rng() * 6)); }
export function reducer(state: DiceDuelState, action: DiceDuelAction): DiceDuelState {
  if (state.phase === "done") return state;
  if (action.type === "duel") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const you = roll3(rng);
    const cpu = roll3(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ys = you.reduce((a,b)=>a+b,0); const cs = cpu.reduce((a,b)=>a+b,0);
    let outcome: "win"|"lose"|"tie" = "tie";
    if (ys > cs) outcome = "win";
    else if (ys < cs) outcome = "lose";
    const pts = outcome === "win" ? 10 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, you, cpu, outcome, wins: state.wins + (outcome === "win" ? 1 : 0), score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, you: null, cpu: null, outcome: null, phase: "ready" };
  }
  return state;
}
export function isTerminal(state: DiceDuelState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
