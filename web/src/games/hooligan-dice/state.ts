import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const DICE_COUNT = 5;

export interface HooliganDiceSettings { dummy: boolean; }

export interface HooliganDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type HooliganDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: HooliganDiceSettings): HooliganDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: HooliganDiceState, action: HooliganDiceAction): HooliganDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    let pts = 0; let msg = "";
    if (state.round <= 6) {
      const target = state.round;
      const matches = d.filter(x => x === target).length;
      pts = matches * target * 10;
      msg = matches + " of " + target + "s +" + pts;
    } else if (state.round === 7) {
      pts = d.reduce((a,b)=>a+b,0) * 2;
      msg = "Bonus sum ×2 +" + pts;
    } else {
      const counts = [0,0,0,0,0,0,0]; for (const x of d) counts[x] = (counts[x] ?? 0) + 1;
      let bestPair = 0;
      for (let i = 6; i >= 1; i--) if ((counts[i] ?? 0) >= 2) { bestPair = i; break; }
      pts = bestPair * 30;
      msg = "Top pair " + bestPair + "s +" + pts;
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

export function isTerminal(state: HooliganDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
