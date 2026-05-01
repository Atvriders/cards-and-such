import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceFlyFishingSettings { dummy: boolean; }

export interface DiceFlyFishingState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  fish: number;
}

export type DiceFlyFishingAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceFlyFishingSettings): DiceFlyFishingState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    fish: 0,
  };
}

export function reducer(state: DiceFlyFishingState, action: DiceFlyFishingAction): DiceFlyFishingState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceFlyFishingState> = {};
    const cast = dice[0]! + dice[1]!;
    let pts0 = 0;
    if (cast >= 11) pts0 = 50;
    else if (cast >= 9) pts0 = 25;
    else if (cast >= 6) pts0 = 10;
    else if (cast >= 4) pts0 = 3;
    pts = pts0;
    extra.fish = state.fish + (pts0 > 0 ? 1 : 0);
    logEntry = `Cast ${state.round}: ${pts0 > 0 ? `caught (+${pts0})` : "missed"}`;

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

export function isTerminal(state: DiceFlyFishingState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
