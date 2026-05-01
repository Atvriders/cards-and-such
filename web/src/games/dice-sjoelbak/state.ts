import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceSjoelbakSettings { dummy: boolean; }

export interface DiceSjoelbakState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  slots: [number, number, number, number];
}

export type DiceSjoelbakAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceSjoelbakSettings): DiceSjoelbakState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    slots: [0,0,0,0],
  };
}

export function reducer(state: DiceSjoelbakState, action: DiceSjoelbakAction): DiceSjoelbakState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceSjoelbakState> = {};
    const slot = (dice[0]! - 1) % 4;
    const count = dice[1]! >= 5 ? 3 : dice[1]! >= 3 ? 2 : 1;
    const slots = [...state.slots] as [number, number, number, number];
    slots[slot] += count;
    extra.slots = slots;
    const setMin = Math.min(slots[0], slots[1], slots[2], slots[3]);
    pts = count * (slot + 1);
    if (setMin > Math.min(state.slots[0], state.slots[1], state.slots[2], state.slots[3])) {
      pts += 20;
      logEntry = `+${count} in slot ${slot + 1}, completed set bonus +20`;
    } else {
      logEntry = `+${count} in slot ${slot + 1}`;
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

export function isTerminal(state: DiceSjoelbakState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
