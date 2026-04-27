import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Gridmagic: 3x3 magic-square fill. The classic Lo-Shu square is shown with two cells
// blanked. Pick the correct values from a small bank of numbers (1..9) to fill them in.
// 6 puzzles per game.

export const TOTAL_PUZZLES = 6;
export const MAGIC_SUM = 15;

// Use the standard Lo-Shu and rotations / reflections.
// Base square:
//   2 7 6
//   9 5 1
//   4 3 8
const BASE: number[][] = [
  [2, 7, 6, 9, 5, 1, 4, 3, 8],
  [4, 9, 2, 3, 5, 7, 8, 1, 6],
  [8, 3, 4, 1, 5, 9, 6, 7, 2],
  [6, 1, 8, 7, 5, 3, 2, 9, 4],
  [6, 7, 2, 1, 5, 9, 8, 3, 4],
  [2, 9, 4, 7, 5, 3, 6, 1, 8],
  [4, 3, 8, 9, 5, 1, 2, 7, 6],
  [8, 1, 6, 3, 5, 7, 4, 9, 2],
];

export interface GridmagicSettings { dummy: boolean; }

export interface GridmagicPuzzle {
  square: number[];        // 9 cells, full magic square
  blanks: [number, number]; // two indices of blanks (0..8)
  bank: number[];          // 4-card bank of numbers to choose from (includes the two blanks)
}

export interface GridmagicState {
  rngSeed: number;
  puzzles: GridmagicPuzzle[];
  index: number;
  fillA: number | null; // selected value for first blank
  fillB: number | null;
  selectedBlank: 0 | 1;
  score: number;
  phase: "playing" | "result" | "done";
  lastOk: boolean;
}

export type GridmagicAction =
  | { type: "selectBlank"; which: 0 | 1 }
  | { type: "pick"; value: number }
  | { type: "submit" }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genPuzzles(rng: () => number): GridmagicPuzzle[] {
  const out: GridmagicPuzzle[] = [];
  for (let i = 0; i < TOTAL_PUZZLES; i++) {
    const sq = BASE[Math.floor(rng() * BASE.length)]!;
    // pick two distinct indices to blank
    const idxs = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rng);
    const a = idxs[0]!;
    const b = idxs[1]!;
    const va = sq[a]!;
    const vb = sq[b]!;
    // bank: includes both correct values + 2 distractors from 1..9
    const distract: number[] = [];
    const used = new Set<number>([va, vb]);
    while (distract.length < 2) {
      const v = 1 + Math.floor(rng() * 9);
      if (!used.has(v)) { distract.push(v); used.add(v); }
    }
    const bank = shuffle([va, vb, ...distract], rng);
    out.push({ square: [...sq], blanks: [a, b], bank });
  }
  return out;
}

export function initialState(seed: number, _s: GridmagicSettings): GridmagicState {
  const rng = mulberry32(seed);
  const puzzles = genPuzzles(rng);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    puzzles,
    index: 0,
    fillA: null,
    fillB: null,
    selectedBlank: 0,
    score: 0,
    phase: "playing",
    lastOk: false,
  };
}

export function reducer(state: GridmagicState, action: GridmagicAction): GridmagicState {
  if (state.phase === "done") return state;
  if (action.type === "selectBlank") {
    if (state.phase !== "playing") return state;
    return { ...state, selectedBlank: action.which };
  }
  if (action.type === "pick") {
    if (state.phase !== "playing") return state;
    if (state.selectedBlank === 0) return { ...state, fillA: action.value };
    return { ...state, fillB: action.value };
  }
  if (action.type === "submit") {
    if (state.phase !== "playing") return state;
    if (state.fillA === null || state.fillB === null) return state;
    const p = state.puzzles[state.index]!;
    const ok = state.fillA === p.square[p.blanks[0]] && state.fillB === p.square[p.blanks[1]];
    return { ...state, phase: "result", lastOk: ok, score: state.score + (ok ? 30 : 0) };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.index + 1 >= state.puzzles.length) return { ...state, phase: "done" };
    return { ...state, index: state.index + 1, fillA: null, fillB: null, selectedBlank: 0, phase: "playing", lastOk: false };
  }
  return state;
}

export function isTerminal(state: GridmagicState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
