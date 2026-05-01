import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 3;
export const DICE_SIDES = 6;

export interface DiceCrokinoleSettings { dummy: boolean; }

export interface DiceCrokinoleState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  zone20: number;
  zone15: number;
  zone10: number;
}

export type DiceCrokinoleAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceCrokinoleSettings): DiceCrokinoleState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    zone20: 0,
    zone15: 0,
    zone10: 0,
  };
}

export function reducer(state: DiceCrokinoleState, action: DiceCrokinoleAction): DiceCrokinoleState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceCrokinoleState> = {};
    const flick = dice[0]! + dice[1]! + dice[2]!;
    let zone = 5;
    if (flick >= 16) zone = 20;
    else if (flick >= 12) zone = 15;
    else if (flick >= 8) zone = 10;
    pts = zone;
    if (zone === 20) extra.zone20 = state.zone20 + 1;
    else if (zone === 15) extra.zone15 = state.zone15 + 1;
    else if (zone === 10) extra.zone10 = state.zone10 + 1;
    logEntry = `R${state.round}: zone ${zone} (+${zone})`;

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

export function isTerminal(state: DiceCrokinoleState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
