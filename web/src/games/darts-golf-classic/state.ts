import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 9;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DartsGolfClassicSettings { dummy: boolean; }

export interface DartsGolfClassicState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  strokes: number;
  par: number;
}

export type DartsGolfClassicAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DartsGolfClassicSettings): DartsGolfClassicState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    strokes: 0,
    par: 27,
  };
}

export function reducer(state: DartsGolfClassicState, action: DartsGolfClassicAction): DartsGolfClassicState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DartsGolfClassicState> = {};
    const skill = dice[0]! + dice[1]!;
    const strokes = skill >= 11 ? 1 : skill >= 9 ? 2 : skill >= 5 ? 3 : skill >= 3 ? 4 : 5;
    extra.strokes = state.strokes + strokes;
    pts = -strokes;
    logEntry = `Hole ${state.round}: ${strokes} strokes`;

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

export function isTerminal(state: DartsGolfClassicState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
