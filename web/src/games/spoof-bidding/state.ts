import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface SpoofBiddingSettings { dummy: boolean; }

export interface SpoofBiddingState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  rounds: number;
}

export type SpoofBiddingAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: SpoofBiddingSettings): SpoofBiddingState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    rounds: 0,
  };
}

export function reducer(state: SpoofBiddingState, action: SpoofBiddingAction): SpoofBiddingState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<SpoofBiddingState> = {};
    const myCoins = dice[0]!;
    const cpu1 = dice[1]!;
    const cpu2 = dice[2]!;
    const total = myCoins + cpu1 + cpu2;
    const myBid = Math.floor(dice[3] || 3) + dice[0]!;
    if (myBid === total) {
      pts = 5;
      logEntry = `Bid ${myBid} = total ${total}: WIN`;
    } else {
      pts = -1;
      logEntry = `Bid ${myBid} ≠ total ${total}`;
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

export function isTerminal(state: SpoofBiddingState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
