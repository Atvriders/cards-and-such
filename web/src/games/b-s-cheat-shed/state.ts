import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 6;
export interface BSCheatShedSettings { dummy: boolean; }
export interface BSCheatShedState { rngSeed: number; round: number; you: number; cpu: number; phase: "ready" | "scored" | "done"; score: number; pts: number; result: string; wins: number; losses: number; }
export type BSCheatShedAction = { type: "play" } | { type: "next" };

export function initialState(seed: number, _s: BSCheatShedSettings): BSCheatShedState {
  return { rngSeed: seed, round: 1, you: 7, cpu: 7, phase: "ready", score: 0, pts: 0, result: "", wins: 0, losses: 0 };
}
export function reducer(state: BSCheatShedState, action: BSCheatShedAction): BSCheatShedState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const yourLuck = Math.floor(rng() * 100);
    const cpuLuck = Math.floor(rng() * 100);
    const next = Math.floor(rng() * 2 ** 31);
    const youWins = (yourLuck + 8) >= cpuLuck; // slight skill edge
    let pts = 0; let result = "";
    let wins = state.wins, losses = state.losses;
    if (youWins) { pts = 20 + Math.floor(rng() * 8); wins++; result = `You shed first! +${pts}`; }
    else { pts = 0; losses++; result = "CPU emptied first."; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, you: 7, cpu: 7, pts, result, score: state.score + pts, wins, losses, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, phase: "ready", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: BSCheatShedState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
