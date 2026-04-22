import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Lotto 90 — European bingo variant. Numbers 1-90 drawn one at a time.
// Player has a 5×5 card. Numbers match and are marked.
// Line bingo (row/col/diagonal) = 50 pts. Full house = 200 pts.

export interface Lotto90Settings {
  speed: "slow" | "normal" | "fast";
}

export interface Lotto90State {
  settings: Lotto90Settings;
  card: readonly number[];        // 25 numbers on the 5×5 card (0 = empty space)
  marked: readonly boolean[];     // which of the 25 positions are marked
  bag: readonly number[];         // remaining numbers to draw (shuffled 1-90)
  drawn: readonly number[];       // numbers drawn so far
  lastDrawn: number | null;
  linesBingo: number;             // line bingos claimed
  fullHouse: boolean;
  score: number;
  phase: "playing" | "done";
  claimedLines: readonly boolean[]; // 12 lines: 5 rows + 5 cols + 2 diags
}

export type Lotto90Action =
  | { type: "draw" }
  | { type: "claim_line"; lineIndex: number };

// Generate a 5×5 card with numbers from 1-90 (no duplicates)
function makeCard(rng: () => number): number[] {
  const pool = Array.from({ length: 90 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, 25);
}

// Make a shuffled bag of 1-90
function makeBag(rng: () => number): number[] {
  const bag = Array.from({ length: 90 }, (_, i) => i + 1);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j]!, bag[i]!];
  }
  return bag;
}

export function initialState(seed: number, settings: Lotto90Settings): Lotto90State {
  const rng = mulberry32(seed);
  const card = makeCard(rng);
  const bag = makeBag(rng);
  return {
    settings,
    card,
    marked: new Array(25).fill(false),
    bag,
    drawn: [],
    lastDrawn: null,
    linesBingo: 0,
    fullHouse: false,
    score: 0,
    phase: "playing",
    claimedLines: new Array(12).fill(false),
  };
}

// Returns the 25 indices for each of the 12 lines
// Lines: 5 rows (0-4), 5 cols (5-9), 2 diagonals (10-11)
export function getLineIndices(lineIndex: number): number[] {
  if (lineIndex < 5) {
    const r = lineIndex;
    return [0, 1, 2, 3, 4].map((c) => r * 5 + c);
  }
  if (lineIndex < 10) {
    const c = lineIndex - 5;
    return [0, 1, 2, 3, 4].map((r) => r * 5 + c);
  }
  if (lineIndex === 10) return [0, 6, 12, 18, 24];  // top-left to bottom-right
  return [4, 8, 12, 16, 20];  // top-right to bottom-left
}

export function isLineBingo(marked: readonly boolean[], lineIndex: number): boolean {
  return getLineIndices(lineIndex).every((i) => marked[i]);
}

export function isFullHouse(marked: readonly boolean[]): boolean {
  return marked.every(Boolean);
}

export function reducer(state: Lotto90State, action: Lotto90Action): Lotto90State {
  if (state.phase === "done") return state;

  if (action.type === "draw") {
    if (state.bag.length === 0) {
      return { ...state, phase: "done" };
    }
    const [num, ...rest] = state.bag;
    const newDrawn = [...state.drawn, num!];
    const newMarked = state.marked.slice() as boolean[];
    const idx = state.card.indexOf(num!);
    if (idx !== -1) newMarked[idx] = true;

    const fh = isFullHouse(newMarked);
    const phase = fh || rest.length === 0 ? "done" : "playing";

    return {
      ...state,
      bag: rest,
      drawn: newDrawn,
      lastDrawn: num!,
      marked: newMarked,
      fullHouse: fh,
      phase,
    };
  }

  if (action.type === "claim_line") {
    const { lineIndex } = action;
    if (lineIndex < 0 || lineIndex >= 12) return state;
    if (state.claimedLines[lineIndex]) return state;
    if (!isLineBingo(state.marked, lineIndex)) return state;

    const newClaimed = state.claimedLines.slice() as boolean[];
    newClaimed[lineIndex] = true;
    const newScore = state.score + 50;
    return { ...state, claimedLines: newClaimed, linesBingo: state.linesBingo + 1, score: newScore };
  }

  return state;
}

export function isTerminal(state: Lotto90State): { score: number } | null {
  if (state.phase !== "done") return null;
  const fhBonus = state.fullHouse ? 200 : 0;
  return { score: state.score + fhBonus };
}
