import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 3;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface StratHockeySettings { dummy: boolean; }

export interface StratHockeyState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myGoals: number;
  cpuGoals: number;
}

export type StratHockeyAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: StratHockeySettings): StratHockeyState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myGoals: 0,
    cpuGoals: 0,
  };
}

export function reducer(state: StratHockeyState, action: StratHockeyAction): StratHockeyState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<StratHockeyState> = {};
    const myG = (dice[0]! + dice[1]!) >= 9 ? 2 : (dice[0]! + dice[1]!) >= 7 ? 1 : 0;
    const cpuG = (dice[2]! + dice[3]!) >= 9 ? 2 : (dice[2]! + dice[3]!) >= 7 ? 1 : 0;
    extra.myGoals = state.myGoals + myG;
    extra.cpuGoals = state.cpuGoals + cpuG;
    pts = myG * 4 - cpuG * 3;
    logEntry = `P${state.round}: HOME +${myG}, AWAY +${cpuG}`;

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

export function isTerminal(state: StratHockeyState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
