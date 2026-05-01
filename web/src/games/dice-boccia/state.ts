import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 6;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceBocciaSettings { dummy: boolean; }

export interface DiceBocciaState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myStone: number;
  cpuStone: number;
}

export type DiceBocciaAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceBocciaSettings): DiceBocciaState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myStone: 0,
    cpuStone: 0,
  };
}

export function reducer(state: DiceBocciaState, action: DiceBocciaAction): DiceBocciaState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceBocciaState> = {};
    const me = dice[0]! + dice[1]!;
    const cpu = dice[2]! + dice[3]!;
    const myDist = Math.abs(me - 7);
    const cpuDist = Math.abs(cpu - 7);
    extra.myStone = myDist;
    extra.cpuStone = cpuDist;
    if (myDist < cpuDist) {
      pts = (cpuDist - myDist) * 2;
      logEntry = `End ${state.round}: WIN end (+${pts})`;
    } else if (myDist > cpuDist) {
      pts = -(myDist - cpuDist);
      logEntry = `End ${state.round}: lost end (${pts})`;
    } else {
      pts = 1;
      logEntry = `End ${state.round}: tied (+1)`;
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

export function isTerminal(state: DiceBocciaState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
