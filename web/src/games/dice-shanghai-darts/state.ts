import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DIE_COUNT = 3;

export interface DiceShanghaiDartsSettings { dummy: boolean; }

export interface DiceShanghaiDartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lastPts: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceShanghaiDartsAction = { type: "roll" } | { type: "next" };

function rollScore(dice: number[], _round: number): number {
  return (dice.reduce((a,b)=>a+(b<=2?1:b<=4?2:3),0)) + ((dice.includes(1)||dice.includes(2)) && (dice.includes(3)||dice.includes(4)) && (dice.includes(5)||dice.includes(6)) ? 10 : 0);
}

export function initialState(seed: number, _settings: DiceShanghaiDartsSettings): DiceShanghaiDartsState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, phase: "rolling" };
}

export function reducer(state: DiceShanghaiDartsState, action: DiceShanghaiDartsAction): DiceShanghaiDartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = rollScore(dice, state.round);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceShanghaiDartsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
