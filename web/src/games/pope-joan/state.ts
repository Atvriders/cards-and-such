import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface PopeJoanSettings { dummy: boolean; }

export interface PopeJoanState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  pool: number;
}

export type PopeJoanAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: PopeJoanSettings): PopeJoanState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    pool: 50,
  };
}

export function reducer(state: PopeJoanState, action: PopeJoanAction): PopeJoanState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<PopeJoanState> = {};
    const claim = dice[0]! >= 5;
    if (claim) {
      const take = Math.min(state.pool, dice[1]! * 3);
      pts = take;
      extra.pool = state.pool - take;
      logEntry = `Claimed ${take} from pool (${extra.pool} left)`;
    } else {
      pts = 0;
      extra.pool = state.pool + 5;
      logEntry = `Stake +5 (pool ${extra.pool})`;
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

export function isTerminal(state: PopeJoanState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
