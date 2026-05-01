import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface BragThreeCardSettings { dummy: boolean; }

export interface BragThreeCardState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";

}

export type BragThreeCardAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BragThreeCardSettings): BragThreeCardState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",

  };
}

export function reducer(state: BragThreeCardState, action: BragThreeCardAction): BragThreeCardState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<BragThreeCardState> = {};
    const a = dice[0]!, b = dice[1]!, c = dice[2]!;
    let rank = 0;
    if (a === b && b === c) rank = 6; // prial
    else if ((a + 1 === b && b + 1 === c) || (a === c - 2 && b === a + 1)) rank = 5; // run
    else if (a === b || b === c || a === c) rank = 3; // pair
    else rank = a + b + c >= 12 ? 2 : 1;
    const cpu = dice[3] || 2;
    pts = rank > cpu ? rank * 5 : -2;
    logEntry = `Hand ${state.round}: rank ${rank} vs ${cpu}`;

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

export function isTerminal(state: BragThreeCardState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
