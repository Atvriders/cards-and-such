import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceMolkkySettings { dummy: boolean; }

export interface DiceMolkkyState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  total: number;
}

export type DiceMolkkyAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceMolkkySettings): DiceMolkkyState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    total: 0,
  };
}

export function reducer(state: DiceMolkkyState, action: DiceMolkkyAction): DiceMolkkyState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceMolkkyState> = {};
    const a = dice[0]!;
    const b = dice[1]!;
    let knocked = 0;
    if (a >= 5 && b >= 5) knocked = a + b; // multiple pins
    else if (a >= 4 || b >= 4) knocked = Math.max(a, b); // one numbered pin
    let total = state.total + knocked;
    if (total > 50) {
      total = 25;
      pts = -10;
      logEntry = `Over 50 - back to 25`;
    } else {
      pts = knocked;
      logEntry = `Knocked: ${knocked} (total ${total})`;
    }
    extra.total = total;

    const earlyWin = ((extra.total !== undefined && extra.total >= 50));
    const isLast = state.round >= TOTAL_ROUNDS || earlyWin;
    return {
      ...state, ...extra, rngSeed: nextSeed, dice,
      score: state.score + pts, lastPts: pts,
      history: [...state.history, pts],
      log: [...state.log, logEntry].slice(-12),
      phase: isLast ? "done" : "rolled",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceMolkkyState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
