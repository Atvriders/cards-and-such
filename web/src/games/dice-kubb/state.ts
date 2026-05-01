import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceKubbSettings { dummy: boolean; }

export interface DiceKubbState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  cpuKubbs: number;
  myKubbs: number;
}

export type DiceKubbAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKubbSettings): DiceKubbState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    cpuKubbs: 5,
    myKubbs: 5,
  };
}

export function reducer(state: DiceKubbState, action: DiceKubbAction): DiceKubbState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceKubbState> = {};
    const me = dice[0]! + dice[1]!;
    const cpu = dice[2]! + dice[3]!;
    let myDown = 0, cpuDown = 0;
    if (me >= 9) myDown = 2;
    else if (me >= 6) myDown = 1;
    if (cpu >= 9) cpuDown = 2;
    else if (cpu >= 6) cpuDown = 1;
    const newCpu = Math.max(0, state.cpuKubbs - myDown);
    const newMy = Math.max(0, state.myKubbs - cpuDown);
    extra.cpuKubbs = newCpu;
    extra.myKubbs = newMy;
    pts = myDown * 5 - cpuDown * 3;
    if (newCpu === 0) { pts += 50; logEntry = `Knocked king! WIN`; }
    else logEntry = `R${state.round}: knocked ${myDown}, took ${cpuDown}`;

    const earlyWin = ((extra.cpuKubbs !== undefined && extra.cpuKubbs <= 0) || (extra.myKubbs !== undefined && extra.myKubbs <= 0));
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

export function isTerminal(state: DiceKubbState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
