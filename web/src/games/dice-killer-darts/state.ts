import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceKillerDartsSettings { dummy: boolean; }

export interface DiceKillerDartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  cpuLives: number;
  myLives: number;
  isKiller: boolean;
  cpuKiller: boolean;
}

export type DiceKillerDartsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKillerDartsSettings): DiceKillerDartsState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    cpuLives: 5,
    myLives: 5,
    isKiller: false,
    cpuKiller: false,
  };
}

export function reducer(state: DiceKillerDartsState, action: DiceKillerDartsAction): DiceKillerDartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceKillerDartsState> = {};
    const me = dice[0]!;
    const cpu = dice[1]!;
    if (!state.isKiller && me >= 5) {
      extra.isKiller = true;
      logEntry = `Hit double - YOU ARE KILLER`;
      pts = 10;
    } else if (state.isKiller && cpu <= 4) {
      extra.cpuLives = state.cpuLives - 1;
      pts = 5;
      logEntry = `Killed CPU life (${state.cpuLives - 1} left)`;
      if (state.cpuLives - 1 <= 0) { pts += 50; logEntry = `KO! CPU eliminated`; }
    } else if (state.cpuKiller && me <= 4) {
      extra.myLives = state.myLives - 1;
      pts = -5;
      logEntry = `CPU killed your life (${state.myLives - 1} left)`;
    } else if (!state.cpuKiller && cpu >= 5) {
      extra.cpuKiller = true;
      logEntry = `CPU is now Killer`;
      pts = -2;
    } else {
      logEntry = `No effect`;
    }

    const earlyWin = ((extra.cpuLives !== undefined && extra.cpuLives <= 0) || (extra.myLives !== undefined && extra.myLives <= 0));
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

export function isTerminal(state: DiceKillerDartsState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
