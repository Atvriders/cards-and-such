import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 4;
export const PUZZLE_COUNT = 4;

export interface EightQueensMiniSettings { dummy: boolean; }

export interface EightQueensMiniState {
  rngSeed: number;
  puzzleIndex: number;
  queens: boolean[]; // SIZE*SIZE
  conflicts: boolean[]; // cells currently under attack from a placed queen
  score: number;
  message: string;
  phase: "playing" | "done";
}

export type EightQueensMiniAction =
  | { type: "toggle"; idx: number }
  | { type: "submit" }
  | { type: "reset" };

function isValid(q: boolean[]): boolean {
  const positions: { r: number; c: number }[] = [];
  for (let i = 0; i < q.length; i++) {
    if (q[i]) positions.push({ r: Math.floor(i / SIZE), c: i % SIZE });
  }
  if (positions.length !== SIZE) return false;
  const rows = new Set<number>(),
    cols = new Set<number>(),
    d1 = new Set<number>(),
    d2 = new Set<number>();
  for (const { r, c } of positions) {
    if (rows.has(r) || cols.has(c) || d1.has(r - c) || d2.has(r + c)) return false;
    rows.add(r);
    cols.add(c);
    d1.add(r - c);
    d2.add(r + c);
  }
  return true;
}

export function computeConflicts(q: boolean[]): boolean[] {
  // Mark every empty square attacked by at least one queen.
  const conflicts = new Array(q.length).fill(false);
  for (let i = 0; i < q.length; i++) {
    if (!q[i]) continue;
    const qr = Math.floor(i / SIZE),
      qc = i % SIZE;
    for (let j = 0; j < q.length; j++) {
      if (j === i) continue;
      const r = Math.floor(j / SIZE),
        c = j % SIZE;
      if (r === qr || c === qc || r - c === qr - qc || r + c === qr + qc) {
        conflicts[j] = true;
      }
    }
  }
  return conflicts;
}

export function initialState(seed: number, _settings: EightQueensMiniSettings): EightQueensMiniState {
  return {
    rngSeed: seed,
    puzzleIndex: 0,
    queens: Array(SIZE * SIZE).fill(false),
    conflicts: Array(SIZE * SIZE).fill(false),
    score: 0,
    message: "",
    phase: "playing",
  };
}

export function reducer(state: EightQueensMiniState, action: EightQueensMiniAction): EightQueensMiniState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    const q = state.queens.slice();
    q[action.idx] = !q[action.idx];
    return { ...state, queens: q, conflicts: computeConflicts(q), message: "" };
  }
  if (action.type === "reset") {
    const q = Array(SIZE * SIZE).fill(false);
    return { ...state, queens: q, conflicts: q.slice(), message: "" };
  }
  if (action.type === "submit") {
    const ok = isValid(state.queens);
    if (!ok) {
      const placed = state.queens.filter(Boolean).length;
      const msg = placed !== SIZE
        ? `Place exactly ${SIZE} queens (have ${placed}).`
        : "Queens are still attacking each other.";
      return { ...state, message: msg };
    }
    const next = state.puzzleIndex + 1;
    const empty = Array(SIZE * SIZE).fill(false);
    if (next >= PUZZLE_COUNT) {
      return { ...state, score: state.score + 25, message: "Solved! +25", phase: "done" };
    }
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      rngSeed: seed2,
      queens: empty,
      conflicts: empty.slice(),
      score: state.score + 25,
      puzzleIndex: next,
      message: "Solved! +25 — next puzzle",
    };
  }
  return state;
}

export function isTerminal(state: EightQueensMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
