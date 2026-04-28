import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const DICE_COUNT = 5;

export interface GeneralaDobleSettings { dummy: boolean; }

export interface GeneralaDobleState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type GeneralaDobleAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: GeneralaDobleSettings): GeneralaDobleState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: GeneralaDobleState, action: GeneralaDobleAction): GeneralaDobleState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const counts = [0,0,0,0,0,0,0]; for (const x of d) counts[x] = (counts[x] ?? 0) + 1;
    const max = Math.max(...counts);
    let pts = 0; let msg = "";
    const has3 = counts.indexOf(3) >= 0;
    const has2 = counts.indexOf(2) >= 0;
    const sortedD = [...d].sort((a,b)=>a-b).join(",");
    const isStraight = sortedD === "1,2,3,4,5" || sortedD === "2,3,4,5,6";
    if (max === 5) { pts = 100; msg = "Generala Doble! +100"; }
    else if (max === 4) { pts = 80; msg = "Poker Doble! +80"; }
    else if (has3 && has2) { pts = 60; msg = "Full House Doble! +60"; }
    else if (isStraight) { pts = 50; msg = "Straight Doble! +50"; }
    else if (max === 3) { pts = 40; msg = "Three of a kind Doble! +40"; }
    else if (has2) { const pairFace = counts.lastIndexOf(2); pts = pairFace * 4; msg = "Pair " + pairFace + "s +" + pts; }
    else { pts = 0; msg = "No score."; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: GeneralaDobleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
