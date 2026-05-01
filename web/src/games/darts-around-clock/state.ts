import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 40;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DartsAroundClockSettings { dummy: boolean; }

export interface DartsAroundClockState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  target: number;
  hits: number;
  misses: number;
  cleared: boolean;
}

export type DartsAroundClockAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DartsAroundClockSettings): DartsAroundClockState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    target: 1,
    hits: 0,
    misses: 0,
    cleared: false,
  };
}

export function reducer(state: DartsAroundClockState, action: DartsAroundClockAction): DartsAroundClockState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DartsAroundClockState> = {};
    const sum = dice[0]! + dice[1]!;
    const hit = sum >= state.target + 2;
    if (hit) {
      pts = 5;
      const newT = state.target + 1;
      if (newT > 21) {
        extra.cleared = true;
        extra.target = 21;
        logEntry = `Bullseye! Cleared the clock`;
      } else {
        extra.target = newT;
        logEntry = `Hit ${state.target} (next: ${newT})`;
      }
    } else {
      extra.misses = state.misses + 1;
      logEntry = `Missed ${state.target}`;
    }

    const earlyWin = (extra.cleared === true);
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

export function isTerminal(state: DartsAroundClockState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
