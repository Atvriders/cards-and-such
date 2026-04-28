import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 4;
export const PUZZLE_COUNT = 4;

export interface EightQueensMiniSettings { dummy: boolean; }

export interface EightQueensMiniState {
  rngSeed: number;
  puzzleIndex: number;
  queens: boolean[]; // SIZE*SIZE
  score: number;
  message: string;
  phase: "playing" | "done";
}

export type EightQueensMiniAction = { type: "toggle"; idx: number } | { type: "submit" } | { type: "reset" };

function isValid(q: boolean[]): boolean {
  // SIZE queens placed; no two share row, col, or diagonal
  const positions: { r: number; c: number }[] = [];
  for (let i = 0; i < q.length; i++) if (q[i]) {
    positions.push({ r: Math.floor(i / SIZE), c: i % SIZE });
  }
  if (positions.length !== SIZE) return false;
  const rows = new Set<number>(), cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
  for (const { r, c } of positions) {
    if (rows.has(r) || cols.has(c) || d1.has(r - c) || d2.has(r + c)) return false;
    rows.add(r); cols.add(c); d1.add(r - c); d2.add(r + c);
  }
  return true;
}

export function initialState(seed: number, _settings: EightQueensMiniSettings): EightQueensMiniState {
  return { rngSeed: seed, puzzleIndex: 0, queens: Array(SIZE * SIZE).fill(false), score: 0, message: "", phase: "playing" };
}

export function reducer(state: EightQueensMiniState, action: EightQueensMiniAction): EightQueensMiniState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    const q = state.queens.slice();
    q[action.idx] = !q[action.idx];
    return { ...state, queens: q, message: "" };
  }
  if (action.type === "reset") {
    return { ...state, queens: Array(SIZE * SIZE).fill(false), message: "" };
  }
  if (action.type === "submit") {
    const ok = isValid(state.queens);
    if (!ok) return { ...state, message: "Invalid! Need " + SIZE + " non-attacking queens." };
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLE_COUNT) {
      return { ...state, score: state.score + 25, message: "Solved! +25", phase: "done" };
    }
    // Note: rng is not used here but we advance seed deterministically
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: seed2, queens: Array(SIZE * SIZE).fill(false), score: state.score + 25, puzzleIndex: next, message: "Solved! +25" };
  }
  return state;
}

export function isTerminal(state: EightQueensMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
