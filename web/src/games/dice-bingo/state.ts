import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Bingo: 5x5 grid filled with 25 random face values 1-6 (with repeats).
// Each round, roll 1 die. Mark any one square that matches.
// 25 rounds. Score: +5 per square marked, +50 line bonus per row/col/diag completed.
// Auto-marks first available match (we surface the choice via a "skip" action when no match).

export const TOTAL_ROUNDS = 25;

export interface DiceBingoSettings { dummy: boolean; }
export interface DiceBingoState {
  rngSeed: number;
  round: number;
  grid: number[];     // 25 cells, values 1..6
  marked: boolean[];  // 25
  lastRoll: number | null;
  score: number;
  phase: "rolling" | "rolled" | "done";
  linesCount: number;
}
export type DiceBingoAction = { type: "roll" } | { type: "mark"; idx: number } | { type: "skip" };

function generateGrid(rng: () => number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 25; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

const LINES: number[][] = [
  // rows
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  // cols
  [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
  // diagonals
  [0,6,12,18,24],[4,8,12,16,20],
];

export function countCompleteLines(marked: boolean[]): number {
  let n = 0;
  for (const line of LINES) if (line.every(i => marked[i])) n++;
  return n;
}

export function initialState(seed: number, _settings: DiceBingoSettings): DiceBingoState {
  const rng = mulberry32(seed);
  const grid = generateGrid(rng);
  return { rngSeed: Math.floor(rng() * 2 ** 31), round: 1, grid, marked: Array(25).fill(false), lastRoll: null, score: 0, phase: "rolling", linesCount: 0 };
}

export function reducer(state: DiceBingoState, action: DiceBingoAction): DiceBingoState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, lastRoll: r, phase: "rolled" };
  }
  if (action.type === "mark") {
    if (state.phase !== "rolled") return state;
    if (state.marked[action.idx]) return state;
    if (state.grid[action.idx] !== state.lastRoll) return state;
    const marked = [...state.marked];
    marked[action.idx] = true;
    const newLines = countCompleteLines(marked);
    const lineBonus = (newLines - state.linesCount) * 50;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, marked, score: state.score + 5 + lineBonus, phase: isLast ? "done" : "rolling", round: state.round + 1, lastRoll: null, linesCount: newLines };
  }
  if (action.type === "skip") {
    if (state.phase !== "rolled") return state;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, phase: isLast ? "done" : "rolling", round: state.round + 1, lastRoll: null };
  }
  return state;
}

export function isTerminal(state: DiceBingoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
