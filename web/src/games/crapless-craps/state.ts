import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 2;

export interface CraplessCrapsSettings { dummy: boolean; }

export interface CraplessCrapsState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type CraplessCrapsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: CraplessCrapsSettings): CraplessCrapsState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: CraplessCrapsState, action: CraplessCrapsAction): CraplessCrapsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const d0 = d[0] ?? 0; const d1 = d[1] ?? 0; const sum = d0 + d1;
    let pts = 0; let msg = "";
    if (sum === 7 || sum === 11) { pts = 30; msg = "Natural " + sum + "! +30"; }
    else if (sum === 2 || sum === 3 || sum === 12) { pts = 15; msg = "Point " + sum + " (crapless) +15"; }
    else { pts = 10 + sum; msg = "Point " + sum + " +" + pts; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: CraplessCrapsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
