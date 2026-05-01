import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 24;
export const DICE_COUNT = 3;
export const DICE_SIDES = 6;

export interface DiceCricketDartsSettings { dummy: boolean; }

export interface DiceCricketDartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  marks: { [k: string]: number };
  closed: number;
}

export type DiceCricketDartsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceCricketDartsSettings): DiceCricketDartsState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    marks: { "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "B": 0 },
    closed: 0,
  };
}

export function reducer(state: DiceCricketDartsState, action: DiceCricketDartsAction): DiceCricketDartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceCricketDartsState> = {};
    const targets = ["15","16","17","18","19","20","B"];
    const idx = (dice[0]! + dice[1]!) % targets.length;
    const target = targets[idx]!;
    const hits = dice[2]! >= 5 ? 3 : dice[2]! >= 3 ? 2 : 1;
    const newMarks = { ...state.marks, [target]: Math.min(3, (state.marks[target] || 0) + hits) };
    let closed = 0;
    for (const t of targets) if ((newMarks[t] || 0) >= 3) closed++;
    extra.marks = newMarks;
    extra.closed = closed;
    if ((newMarks[target] || 0) >= 3 && (state.marks[target] || 0) < 3) {
      pts = 25;
      logEntry = `Closed ${target} (+25)`;
    } else if ((state.marks[target] || 0) >= 3) {
      pts = target === "B" ? 25 : parseInt(target, 10);
      logEntry = `${target} score (+${pts})`;
    } else {
      pts = hits;
      logEntry = `${target}: ${hits} mark${hits > 1 ? "s" : ""}`;
    }

    const earlyWin = (extra.closed === 7);
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

export function isTerminal(state: DiceCricketDartsState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
