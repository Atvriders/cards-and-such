import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 40;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface CribbageDoubleSkunkSettings { dummy: boolean; }

export interface CribbageDoubleSkunkState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myPeg: number;
  cpuPeg: number;
}

export type CribbageDoubleSkunkAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: CribbageDoubleSkunkSettings): CribbageDoubleSkunkState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myPeg: 0,
    cpuPeg: 0,
  };
}

export function reducer(state: CribbageDoubleSkunkState, action: CribbageDoubleSkunkAction): CribbageDoubleSkunkState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<CribbageDoubleSkunkState> = {};
    const handMe = (dice[0]! + dice[1]! + dice[2]!) % 12 + 4;
    const handCpu = (dice[1]! + dice[2]! + (dice[3] || 3)) % 12 + 3;
    extra.myPeg = state.myPeg + handMe;
    extra.cpuPeg = state.cpuPeg + handCpu;
    pts = handMe;
    logEntry = `Hand ${state.round}: you +${handMe}, CPU +${handCpu}`;

    const earlyWin = ((extra.myPeg !== undefined && extra.myPeg >= 121) || (extra.cpuPeg !== undefined && extra.cpuPeg >= 121));
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

export function isTerminal(state: CribbageDoubleSkunkState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
