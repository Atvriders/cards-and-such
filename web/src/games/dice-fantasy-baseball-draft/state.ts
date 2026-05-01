import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceFantasyBaseballDraftSettings { dummy: boolean; }

export interface DiceFantasyBaseballDraftState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  picks: number[];
  totalRating: number;
}

export type DiceFantasyBaseballDraftAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceFantasyBaseballDraftSettings): DiceFantasyBaseballDraftState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    picks: [],
    totalRating: 0,
  };
}

export function reducer(state: DiceFantasyBaseballDraftState, action: DiceFantasyBaseballDraftAction): DiceFantasyBaseballDraftState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceFantasyBaseballDraftState> = {};
    const overall = dice[0]! * 10 + dice[1]! + dice[2]! + (dice[3] || 0);
    const sched = dice[1]! >= 5 ? 1.2 : 1.0;
    const rating = Math.floor(overall * sched);
    extra.picks = [...state.picks, rating];
    extra.totalRating = state.totalRating + rating;
    pts = rating;
    logEntry = `Pick ${state.round}: rating ${rating}`;

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

export function isTerminal(state: DiceFantasyBaseballDraftState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
