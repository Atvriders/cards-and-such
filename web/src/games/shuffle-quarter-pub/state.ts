import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface ShuffleQuarterPubSettings { dummy: boolean; }

export interface ShuffleQuarterPubState {
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

export type ShuffleQuarterPubAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: ShuffleQuarterPubSettings): ShuffleQuarterPubState {
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

export function reducer(state: ShuffleQuarterPubState, action: ShuffleQuarterPubAction): ShuffleQuarterPubState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<ShuffleQuarterPubState> = {};
    const myZ = dice[0]! + dice[1]!;
    const cpuZ = dice[2]! + (dice[3] || 3);
    let mePts = myZ >= 11 ? 4 : myZ >= 8 ? 3 : myZ >= 5 ? 1 : 0;
    let cpuPts = cpuZ >= 11 ? 4 : cpuZ >= 8 ? 3 : cpuZ >= 5 ? 1 : 0;
    extra.myScore = state.myScore + mePts;
    extra.cpuScore = state.cpuScore + cpuPts;
    pts = mePts;
    logEntry = `R${state.round}: ${mePts} (CPU ${cpuPts})`;

    const earlyWin = ((extra.myScore !== undefined && extra.myScore >= 21) || (extra.cpuScore !== undefined && extra.cpuScore >= 21));
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

export function isTerminal(state: ShuffleQuarterPubState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
