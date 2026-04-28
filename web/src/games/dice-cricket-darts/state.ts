import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 25;
export const DIE_COUNT = 3;
export const TARGETS = 6; // dice values 1..6 -> targets

export interface DiceCricketDartsSettings { dummy: boolean; }

export interface DiceCricketDartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  marks: number[]; // 6 entries, 0..3
  score: number;
  lastPts: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceCricketDartsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceCricketDartsSettings): DiceCricketDartsState {
  return { rngSeed: seed, round: 1, dice: null, marks: [0,0,0,0,0,0], score: 0, lastPts: 0, phase: "rolling" };
}

export function reducer(state: DiceCricketDartsState, action: DiceCricketDartsAction): DiceCricketDartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newMarks = [...state.marks];
    let pts = 0;
    for (const d of dice) {
      const idx = d - 1;
      if (newMarks[idx]! < 3) {
        newMarks[idx] = newMarks[idx]! + 1;
      } else {
        pts += 5; // overflow points
      }
    }
    pts += newMarks.filter(m => m >= 3).length * 1; // +1 per closed target each round
    const allClosed = newMarks.every(m => m >= 3);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, marks: newMarks, score: state.score + pts, lastPts: pts, phase: (allClosed && state.round >= 5) || isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceCricketDartsState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score + state.marks.filter(m => m >= 3).length * 5 };
}
