import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 30;
export const DICE_COUNT = 3;
export const DICE_SIDES = 6;

export interface Dice301DartsSettings { dummy: boolean; }

export interface Dice301DartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  remaining: number;
  busts: number;
  finished: boolean;
}

export type Dice301DartsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: Dice301DartsSettings): Dice301DartsState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    remaining: 301,
    busts: 0,
    finished: false,
  };
}

export function reducer(state: Dice301DartsState, action: Dice301DartsAction): Dice301DartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<Dice301DartsState> = {};
    const v = dice[0]! * (dice[1]! >= 5 ? 3 : dice[1]! >= 3 ? 2 : 1) + (dice.length > 2 ? dice[2]! * 2 : 0);
    const score = Math.min(180, v);
    const newRem = state.remaining - score;
    if (newRem === 0) {
      pts = state.remaining;
      extra.remaining = 0;
      extra.finished = true;
      logEntry = `R${state.round}: -${score} CHECKOUT! ${newRem} left`;
    } else if (newRem < 0 || newRem === 1) {
      extra.busts = state.busts + 1;
      logEntry = `R${state.round}: BUST (${score})`;
      pts = -2;
    } else {
      pts = score;
      extra.remaining = newRem;
      logEntry = `R${state.round}: -${score} (${newRem} left)`;
    }

    const earlyWin = (extra.finished === true);
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

export function isTerminal(state: Dice301DartsState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
