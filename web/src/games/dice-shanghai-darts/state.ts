import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DICE_COUNT = 3;
export const DICE_SIDES = 6;

export interface DiceShanghaiDartsSettings { dummy: boolean; }

export interface DiceShanghaiDartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  shanghaied: boolean;
}

export type DiceShanghaiDartsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceShanghaiDartsSettings): DiceShanghaiDartsState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    shanghaied: false,
  };
}

export function reducer(state: DiceShanghaiDartsState, action: DiceShanghaiDartsAction): DiceShanghaiDartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceShanghaiDartsState> = {};
    const single = dice[0]! >= 3;
    const dbl = dice[1]! >= 5;
    const trip = dice[2]! >= 6;
    const target = ((state.round - 1) % 20) + 1;
    let mult = 0;
    if (single) mult += 1;
    if (dbl) mult += 2;
    if (trip) mult += 3;
    pts = target * mult;
    if (single && dbl && trip) {
      extra.shanghaied = true;
      pts += 50;
      logEntry = `R${state.round}: SHANGHAI on ${target}!`;
    } else {
      logEntry = `R${state.round}: ${target} x ${mult} = ${pts}`;
    }

    const earlyWin = (extra.shanghaied === true);
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

export function isTerminal(state: DiceShanghaiDartsState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
