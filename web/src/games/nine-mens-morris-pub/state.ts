import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 24;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface NineMensMorrisPubSettings { dummy: boolean; }

export interface NineMensMorrisPubState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myMen: number;
  cpuMen: number;
  myMills: number;
  cpuMills: number;
}

export type NineMensMorrisPubAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: NineMensMorrisPubSettings): NineMensMorrisPubState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myMen: 9,
    cpuMen: 9,
    myMills: 0,
    cpuMills: 0,
  };
}

export function reducer(state: NineMensMorrisPubState, action: NineMensMorrisPubAction): NineMensMorrisPubState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<NineMensMorrisPubState> = {};
    const meMill = (dice[0]! + dice[1]!) >= 10;
    const cpuMill = (dice[2]! + (dice[3] || 3)) >= 10;
    if (meMill) {
      extra.myMills = state.myMills + 1;
      extra.cpuMen = Math.max(0, state.cpuMen - 1);
      pts = 10;
      logEntry = `Mill formed! CPU -1 man`;
    } else if (cpuMill) {
      extra.cpuMills = state.cpuMills + 1;
      extra.myMen = Math.max(0, state.myMen - 1);
      pts = -5;
      logEntry = `CPU mill! You -1 man`;
    } else {
      pts = 1;
      logEntry = `Move`;
    }

    const earlyWin = ((extra.cpuMen !== undefined && extra.cpuMen <= 2) || (extra.myMen !== undefined && extra.myMen <= 2));
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

export function isTerminal(state: NineMensMorrisPubState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
