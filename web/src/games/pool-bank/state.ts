import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 40;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface PoolBankSettings { dummy: boolean; }

export interface PoolBankState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  ballsLeft: number;
  fouls: number;
}

export type PoolBankAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: PoolBankSettings): PoolBankState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    ballsLeft: 9,
    fouls: 0,
  };
}

export function reducer(state: PoolBankState, action: PoolBankAction): PoolBankState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<PoolBankState> = {};
    const sink = dice[0]! >= 4;
    const foul = dice[1]! === 1;
    if (foul) {
      extra.fouls = state.fouls + 1;
      pts = -3;
      logEntry = `FOUL (-3)`;
    } else if (sink) {
      const newLeft = Math.max(0, state.ballsLeft - 1);
      extra.ballsLeft = newLeft;
      pts = newLeft === 0 ? 50 : 5;
      logEntry = newLeft === 0 ? `Sank the ${(9)}-ball! WIN` : `Pocketed (${newLeft} left)`;
    } else {
      pts = 0;
      logEntry = `Missed`;
    }

    const earlyWin = ((extra.ballsLeft !== undefined && extra.ballsLeft <= 0));
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

export function isTerminal(state: PoolBankState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
