import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceHalveItSettings { dummy: boolean; }

export interface DiceHalveItState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  total: number;
}

export type DiceHalveItAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceHalveItSettings): DiceHalveItState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    total: 0,
  };
}

export function reducer(state: DiceHalveItState, action: DiceHalveItAction): DiceHalveItState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceHalveItState> = {};
    const sum = dice[0]! + dice[1]!;
    const hit = sum >= 7;
    const target = state.round * 5 + 10;
    if (hit) {
      pts = target;
      extra.total = state.total + target;
      logEntry = `R${state.round}: HIT +${target}`;
    } else {
      extra.total = Math.floor(state.total / 2);
      pts = -Math.floor(state.total / 2);
      logEntry = `R${state.round}: MISS - halved to ${extra.total}`;
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

export function isTerminal(state: DiceHalveItState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
