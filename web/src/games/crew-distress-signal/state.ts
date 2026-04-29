import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const TARGET_SCORE = 70;
export interface CrewDistressSignalSettings { dummy: boolean; }
export interface CrewDistressSignalState {
  rngSeed: number;
  round: number;
  playerRoll: number;
  cpuRoll: number;
  lastPts: number;
  teamScore: number;
  phase: "ready" | "rolled" | "done";
}
export type CrewDistressSignalAction = { type: "play" } | { type: "next" };
export function initialState(seed: number, _s: CrewDistressSignalSettings): CrewDistressSignalState {
  return { rngSeed: seed, round: 1, playerRoll: 0, cpuRoll: 0, lastPts: 0, teamScore: 0, phase: "ready" };
}
export function reducer(state: CrewDistressSignalState, action: CrewDistressSignalAction): CrewDistressSignalState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const pr = 1 + Math.floor(rng() * 6);
    const cr = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = pr + cr;
    const newScore = state.teamScore + pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, playerRoll: pr, cpuRoll: cr, lastPts: pts, teamScore: newScore, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, playerRoll: 0, cpuRoll: 0, lastPts: 0, phase: "ready" };
  }
  return state;
}
export function isTerminal(state: CrewDistressSignalState): { score: number } | null {
  if (state.phase !== "done") return null;
  const bonus = state.teamScore >= TARGET_SCORE ? 50 : 0;
  return { score: state.teamScore + bonus };
}
