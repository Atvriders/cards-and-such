import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 4;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface StratFootballSettings { dummy: boolean; }

export interface StratFootballState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myScore: number;
  cpuScore: number;
}

export type StratFootballAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: StratFootballSettings): StratFootballState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myScore: 0,
    cpuScore: 0,
  };
}

export function reducer(state: StratFootballState, action: StratFootballAction): StratFootballState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<StratFootballState> = {};
    const off = dice[0]! + dice[1]!;
    const def = dice[2]! + dice[3]!;
    let mePts = 0, cpuPts = 0;
    if (off - def >= 5) mePts = 7;
    else if (off - def >= 2) mePts = 3;
    if (def - off >= 5) cpuPts = 7;
    else if (def - off >= 2) cpuPts = 3;
    extra.myScore = state.myScore + mePts;
    extra.cpuScore = state.cpuScore + cpuPts;
    pts = mePts * 3 - cpuPts * 2;
    logEntry = `Q${state.round}: HOME +${mePts}, AWAY +${cpuPts}`;

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

export function isTerminal(state: StratFootballState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
