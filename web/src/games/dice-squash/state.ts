import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 80;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceSquashSettings { dummy: boolean; }

export interface DiceSquashState {
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

export type DiceSquashAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceSquashSettings): DiceSquashState {
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

export function reducer(state: DiceSquashState, action: DiceSquashAction): DiceSquashState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceSquashState> = {};
    const me = dice[0]! + dice[1]!;
    const cpu = dice[2]! + dice[3]!;
    if (me > cpu) {
      extra.myPts = state.myPts + 1;
      pts = 1;
      logEntry = `Rally ${state.round}: WON (${me} vs ${cpu})`;
    } else if (cpu > me) {
      extra.cpuPts = state.cpuPts + 1;
      pts = 0;
      logEntry = `Rally ${state.round}: lost (${me} vs ${cpu})`;
    } else {
      pts = 0;
      logEntry = `Rally ${state.round}: replay (${me})`;
    }

    const earlyWin = ((extra.myPts !== undefined && extra.myPts >= 11) || (extra.cpuPts !== undefined && extra.cpuPts >= 11));
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

export function isTerminal(state: DiceSquashState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
