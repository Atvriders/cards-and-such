// Numlinks: 4x4 grid with numbers 1..16 placed in shuffled order. Click cells in
// strictly increasing order (1, 2, 3, ...) to score. Each correct click +10. A wrong
// click ends the puzzle. 8 puzzles total.

export const TOTAL_PUZZLES = 8;
export const GRID_SIZE = 16;

export interface NumlinksSettings { dummy: boolean; }

export interface NumlinksState {
  rngSeed: number;
  puzzle: number;
  cells: number[]; // 16 numbers (1..16) shuffled
  next: number;    // next expected click value (starts at 1)
  score: number;
  phase: "playing" | "finished" | "done";
}

export type NumlinksAction = { type: "click"; index: number } | { type: "next" };

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffle(rng: () => number): number[] {
  const arr = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function initialState(seed: number, _s: NumlinksSettings): NumlinksState {
  const rng = lcg(seed);
  const cells = shuffle(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, puzzle: 1, cells, next: 1, score: 0, phase: "playing" };
}

export function reducer(state: NumlinksState, action: NumlinksAction): NumlinksState {
  if (state.phase === "done") return state;
  if (action.type === "click") {
    if (state.phase !== "playing") return state;
    const v = state.cells[action.index];
    if (v === undefined) return state;
    if (v !== state.next) {
      return { ...state, phase: "finished" };
    }
    const ns = state.next + 1;
    const newScore = state.score + 10;
    if (ns > GRID_SIZE) {
      return { ...state, next: ns, score: newScore + 50, phase: "finished" };
    }
    return { ...state, next: ns, score: newScore };
  }
  if (action.type === "next") {
    if (state.phase !== "finished") return state;
    if (state.puzzle >= TOTAL_PUZZLES) return { ...state, phase: "done" };
    const rng = lcg(state.rngSeed);
    const cells = shuffle(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, puzzle: state.puzzle + 1, cells, next: 1, phase: "playing" };
  }
  return state;
}

export function isTerminal(state: NumlinksState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
