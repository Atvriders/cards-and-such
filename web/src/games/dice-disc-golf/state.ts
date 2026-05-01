import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 9;
export const DICE_COUNT = 2;
export const DICE_SIDES = 6;

export interface DiceDiscGolfSettings { dummy: boolean; }

export interface DiceDiscGolfState {
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

export type DiceDiscGolfAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceDiscGolfSettings): DiceDiscGolfState {
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

export function reducer(state: DiceDiscGolfState, action: DiceDiscGolfAction): DiceDiscGolfState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceDiscGolfState> = {};
    const skill = dice[0]! + dice[1]!;
    const strokes = skill >= 11 ? 2 : skill >= 9 ? 3 : skill >= 5 ? 4 : skill >= 3 ? 5 : 6;
    extra.strokes = state.strokes + strokes;
    pts = strokes <= 3 ? 5 : strokes === 4 ? 2 : -2;
    logEntry = `Hole ${state.round}: ${strokes} strokes (par 3)`;

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

export function isTerminal(state: DiceDiscGolfState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
