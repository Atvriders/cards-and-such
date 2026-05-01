import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 40;
export const DICE_COUNT = 3;
export const DICE_SIDES = 6;

export interface ShoveHapennySettings { dummy: boolean; }

export interface ShoveHapennyState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  beds: number[];
}

export type ShoveHapennyAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: ShoveHapennySettings): ShoveHapennyState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    beds: [0,0,0,0,0,0,0,0,0],
  };
}

export function reducer(state: ShoveHapennyState, action: ShoveHapennyAction): ShoveHapennyState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<ShoveHapennyState> = {};
    const which = (dice[0]! + dice[1]! - 2) % 9; // 0..8 = beds 1..9
    const nudge = dice[2]! >= 5 ? 1 : 0;
    const newBeds = [...state.beds];
    if (newBeds[which]! < 3) {
      newBeds[which] = newBeds[which]! + 1;
      pts = (which + 1) + nudge;
      logEntry = `Bed ${which + 1}: shove ${nudge ? "+ nudge" : ""} +${pts}`;
    } else {
      pts = nudge;
      logEntry = `Bed ${which + 1} full - nudge ${nudge ? "+1" : "0"}`;
    }
    extra.beds = newBeds;

    const earlyWin = ((extra.beds !== undefined && extra.beds.every(b => b >= 3)));
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

export function isTerminal(state: ShoveHapennyState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
