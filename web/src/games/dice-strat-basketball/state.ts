import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 4;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceStratBasketballSettings { dummy: boolean; }

export interface DiceStratBasketballState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myPts: number;
  cpuPts: number;
}

export type DiceStratBasketballAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceStratBasketballSettings): DiceStratBasketballState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myPts: 0,
    cpuPts: 0,
  };
}

export function reducer(state: DiceStratBasketballState, action: DiceStratBasketballAction): DiceStratBasketballState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceStratBasketballState> = {};
    let mePts = 0, cpuPts = 0;
    for (let i = 0; i < 5; i++) {
      const r = dice[i % dice.length]!;
      if (r >= 5) mePts += 2;
      if (r >= 6) mePts += 1;
    }
    cpuPts = (dice[0]! + dice[1]! + dice[2]! + (dice[3] || 3)) * 2;
    mePts += dice[0]! >= 5 ? 3 : 0;
    extra.myPts = state.myPts + mePts;
    extra.cpuPts = state.cpuPts + cpuPts;
    pts = mePts - Math.floor(cpuPts / 3);
    logEntry = `Q${state.round}: HOME ${mePts}, AWAY ${cpuPts}`;

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

export function isTerminal(state: DiceStratBasketballState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
