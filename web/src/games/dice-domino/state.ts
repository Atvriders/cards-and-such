import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Dice Domino: Each round a target domino (a, b) is shown. You roll 2 dice. Match either side -> +5; match both (in any order) -> +20.
// 10 rounds.
export const TOTAL_ROUNDS = 10;
export interface DiceDominoSettings { dummy: boolean; }
export interface DiceDominoState {
  rngSeed: number;
  round: number;
  target: [number, number];
  rolled: [number, number] | null;
  score: number;
  phase: "ready" | "rolled" | "done";
  lastBonus: number;
}
export type DiceDominoAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceDominoSettings): DiceDominoState {
  const rng = mulberry32(seed);
  const a = 1 + Math.floor(rng() * 6);
  const b = 1 + Math.floor(rng() * 6);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, target: [a, b], rolled: null, score: 0, phase: "ready", lastBonus: 0 };
}
export function reducer(state: DiceDominoState, action: DiceDominoAction): DiceDominoState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "ready") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sortedTarget = [...state.target].sort();
    const sortedRolled = [a, b].sort();
    let bonus = 0;
    if (sortedTarget[0] === sortedRolled[0] && sortedTarget[1] === sortedRolled[1]) bonus = 20;
    else if (sortedRolled.includes(state.target[0]) || sortedRolled.includes(state.target[1])) bonus = 5;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolled: [a, b], score: state.score + bonus, phase: isLast ? "done" : "rolled", lastBonus: bonus };
  }
  if (action.type === "next" && state.phase === "rolled") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, target: [a, b], rolled: null, phase: "ready", lastBonus: 0 };
  }
  return state;
}
export function isTerminal(state: DiceDominoState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
