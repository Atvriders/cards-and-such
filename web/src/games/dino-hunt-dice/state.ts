import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 3;

export interface DinoHuntDiceSettings { dummy: boolean; }

export interface DinoHuntDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type DinoHuntDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DinoHuntDiceSettings): DinoHuntDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: DinoHuntDiceState, action: DinoHuntDiceAction): DinoHuntDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    let pts = 0; let captures = 0; let escapes = 0; let tramples = 0;
    for (const x of d) {
      if (x <= 2) { pts += x * 10; captures++; }
      else if (x <= 4) { escapes++; }
      else { tramples++; }
    }
    const msg = "Cap:" + captures + " Esc:" + escapes + " Tra:" + tramples + " +" + pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: DinoHuntDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
