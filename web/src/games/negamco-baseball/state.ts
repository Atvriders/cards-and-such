import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 9;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface NegamcoBaseballSettings { dummy: boolean; }

export interface NegamcoBaseballState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  runs: number;
  cpu: number;
}

export type NegamcoBaseballAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: NegamcoBaseballSettings): NegamcoBaseballState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    runs: 0,
    cpu: 0,
  };
}

export function reducer(state: NegamcoBaseballState, action: NegamcoBaseballAction): NegamcoBaseballState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<NegamcoBaseballState> = {};
    const me = dice[0]! + dice[1]!;
    const cpu = dice[2]! + (dice[3] ?? 3);
    let myRuns = 0, cpuRuns = 0;
    if (me >= 11) myRuns = 4;
    else if (me >= 9) myRuns = 2;
    else if (me >= 7) myRuns = 1;
    if (cpu >= 11) cpuRuns = 4;
    else if (cpu >= 9) cpuRuns = 2;
    else if (cpu >= 7) cpuRuns = 1;
    extra.runs = state.runs + myRuns;
    extra.cpu = state.cpu + cpuRuns;
    pts = myRuns * 4 - cpuRuns * 2;
    logEntry = `Inn ${state.round}: HOME ${myRuns}, AWAY ${cpuRuns}`;

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

export function isTerminal(state: NegamcoBaseballState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
