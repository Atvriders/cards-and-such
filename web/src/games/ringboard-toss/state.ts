import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface RingboardTossSettings { dummy: boolean; }

export interface RingboardTossState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  cpuScore: number;
}

export type RingboardTossAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: RingboardTossSettings): RingboardTossState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    cpuScore: 0,
  };
}

export function reducer(state: RingboardTossState, action: RingboardTossAction): RingboardTossState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<RingboardTossState> = {};
    const me = dice[0]! + dice[1]!;
    const cpu = dice[2]! + dice[3]!;
    let myPts = me >= 11 ? 3 : me >= 8 ? 2 : me >= 5 ? 1 : 0;
    let cpuPts = cpu >= 11 ? 3 : cpu >= 8 ? 2 : cpu >= 5 ? 1 : 0;
    pts = myPts;
    extra.cpuScore = state.cpuScore + cpuPts;
    logEntry = `Round ${state.round}: you +${myPts}, CPU +${cpuPts}`;

    const earlyWin = ((state.score + pts >= 50) || (extra.cpuScore !== undefined && extra.cpuScore >= 50));
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

export function isTerminal(state: RingboardTossState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
