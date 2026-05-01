import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 5;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceMmaSettings { dummy: boolean; }

export interface DiceMmaState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myHp: number;
  cpuHp: number;
}

export type DiceMmaAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceMmaSettings): DiceMmaState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myHp: 100,
    cpuHp: 100,
  };
}

export function reducer(state: DiceMmaState, action: DiceMmaAction): DiceMmaState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceMmaState> = {};
    const myStrike = dice[0]! >= 5 ? 25 : dice[0]! >= 3 ? 12 : 5;
    const cpuStrike = dice[1]! >= 5 ? 20 : dice[1]! >= 3 ? 10 : 4;
    extra.cpuHp = Math.max(0, state.cpuHp - myStrike);
    extra.myHp = Math.max(0, state.myHp - cpuStrike);
    pts = myStrike - Math.floor(cpuStrike / 2);
    if (extra.cpuHp === 0) { pts += 100; logEntry = `R${state.round}: KO! Victory`; }
    else logEntry = `R${state.round}: -${myStrike} dealt, took ${cpuStrike}`;

    const earlyWin = ((extra.cpuHp !== undefined && extra.cpuHp <= 0) || (extra.myHp !== undefined && extra.myHp <= 0));
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

export function isTerminal(state: DiceMmaState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
