import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 3;

export interface CthulhuDiceSettings { dummy: boolean; }

export interface CthulhuDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type CthulhuDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: CthulhuDiceSettings): CthulhuDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: CthulhuDiceState, action: CthulhuDiceAction): CthulhuDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    let pts = 0; let msg = "";
    for (const x of d) {
      if (x === 1) pts += 10;
      else if (x === 2) pts += 20;
      else if (x === 3) pts += 15;
      else if (x === 4) pts += 30;
      else if (x === 5) pts -= 15;
      else if (x === 6) pts -= 10;
    }
    if (pts < 0) pts = 0;
    msg = "Eldritch +" + pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: CthulhuDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
