import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 6;

export interface Dice10000Settings { dummy: boolean; }

export interface Dice10000State {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type Dice10000Action = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: Dice10000Settings): Dice10000State {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: Dice10000State, action: Dice10000Action): Dice10000State {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const counts = [0,0,0,0,0,0,0]; for (const x of d) counts[x] = (counts[x] ?? 0) + 1;
    const sortedD = [...d].sort((a,b)=>a-b).join(",");
    let pts = 0; let msg = "";
    const isStraight = sortedD === "1,2,3,4,5,6";
    const pairsCount = counts.filter(c => c === 2).length;
    if (isStraight) { pts = 1500; msg = "Straight 1-6! +1500"; }
    else if (pairsCount === 3) { pts = 1500; msg = "Three pairs! +1500"; }
    else {
      // Multiples
      for (let face = 1; face <= 6; face++) {
        const c = counts[face] ?? 0;
        if (c >= 3) {
          const base = face === 1 ? 1000 : face * 100;
          const mult = c === 6 ? 5 : c === 5 ? 3 : c === 4 ? 2 : 1;
          if (c === 6) { pts += 5000; }
          else { pts += base * mult; }
        } else {
          if (face === 1) pts += c * 100;
          else if (face === 5) pts += c * 50;
        }
      }
      msg = pts === 0 ? "Farkle! 0" : "+" + pts;
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: Dice10000State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
