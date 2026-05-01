import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceTenpinBowlSettings { dummy: boolean; }

export interface DiceTenpinBowlState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";

}

export type DiceTenpinBowlAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceTenpinBowlSettings): DiceTenpinBowlState {
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

export function reducer(state: DiceTenpinBowlState, action: DiceTenpinBowlAction): DiceTenpinBowlState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceTenpinBowlState> = {};
    const sum = dice[0]! + dice[1]!;
    const knocked = Math.max(0, Math.min(10, Math.round(((sum - 2) / 10) * 10)));
    pts = knocked;
    if (knocked === 10) { pts += 5; logEntry = `F${state.round}: STRIKE ${knocked}+5 bonus`; }
    else if (knocked >= 9) { pts += 2; logEntry = `F${state.round}: SPARE ${knocked}+2`; }
    else { logEntry = `F${state.round}: ${knocked} pins`; }

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

export function isTerminal(state: DiceTenpinBowlState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
