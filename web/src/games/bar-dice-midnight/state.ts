import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 6;
export const DICE_SIDES = 6;

export interface BarDiceMidnightSettings { dummy: boolean; }

export interface BarDiceMidnightState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  haveOne: boolean;
  haveFour: boolean;
}

export type BarDiceMidnightAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BarDiceMidnightSettings): BarDiceMidnightState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    haveOne: false,
    haveFour: false,
  };
}

export function reducer(state: BarDiceMidnightState, action: BarDiceMidnightAction): BarDiceMidnightState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<BarDiceMidnightState> = {};
    let one = state.haveOne, four = state.haveFour;
    if (!one && dice.includes(1)) one = true;
    if (!four && dice.includes(4)) four = true;
    extra.haveOne = one;
    extra.haveFour = four;
    if (one && four) {
      const others = dice.filter(d => d !== 1 && d !== 4);
      pts = others.reduce((a, b) => a + b, 0);
      logEntry = `Midnight! Sum ${pts}`;
    } else {
      pts = 0;
      logEntry = `Need: ${one ? "" : "1 "}${four ? "" : "4"}`;
    }

    const earlyWin = (false);
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

export function isTerminal(state: BarDiceMidnightState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
