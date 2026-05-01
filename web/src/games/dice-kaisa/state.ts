import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 30;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceKaisaSettings { dummy: boolean; }

export interface DiceKaisaState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  reds: number;
  breakRun: number;
}

export type DiceKaisaAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKaisaSettings): DiceKaisaState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    reds: 15,
    breakRun: 0,
  };
}

export function reducer(state: DiceKaisaState, action: DiceKaisaAction): DiceKaisaState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceKaisaState> = {};
    const pot = dice[0]! >= 4;
    if (!pot) {
      pts = 0;
      extra.breakRun = 0;
      logEntry = `Miss (break ends)`;
    } else if (state.reds > 0) {
      const colour = dice[1]!;
      const colVal = colour <= 2 ? 2 : colour === 3 ? 3 : colour === 4 ? 4 : colour === 5 ? 5 : colour === 6 ? 7 : 6;
      pts = 1 + colVal;
      extra.reds = state.reds - 1;
      extra.breakRun = state.breakRun + pts;
      logEntry = `Red+colour: +${pts} (run ${extra.breakRun})`;
    } else {
      const colVal = (dice[1]! - 1) + 2; // 2..7
      pts = colVal;
      extra.breakRun = state.breakRun + pts;
      logEntry = `Pot ${colVal}-pt colour`;
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

export function isTerminal(state: DiceKaisaState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
