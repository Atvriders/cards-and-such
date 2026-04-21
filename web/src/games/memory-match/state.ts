import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { SYMBOLS } from "./symbols.js";

export type CellState = "hidden" | "flipped" | "matched";

export interface MemoryMatchState {
  settings: { size: "6" | "8" | "12" | "18" };
  rows: number;
  cols: number;
  /** length rows*cols; each entry is the symbol at that cell (paired). */
  symbols: readonly string[];
  state: readonly CellState[];
  firstFlipped: number | null;
  attempts: number;
  matched: number;
  won: boolean;
  /** Transient: after a mismatch, these two indices are still "flipped" and will flip back. */
  pendingMismatch: readonly [number, number] | null;
}

export type MemoryMatchAction =
  | { type: "flip"; index: number }
  | { type: "dismiss-mismatch" };

const GRID_DIMS: Record<string, { rows: number; cols: number }> = {
  "6":  { rows: 3, cols: 4 },
  "8":  { rows: 4, cols: 4 },
  "12": { rows: 4, cols: 6 },
  "18": { rows: 6, cols: 6 },
};

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function initialState(
  seed: number,
  settings: { size: "6" | "8" | "12" | "18" },
): MemoryMatchState {
  const rng = mulberry32(seed);
  const pairs = parseInt(settings.size, 10);
  const { rows, cols } = GRID_DIMS[settings.size]!;

  // Pick `pairs` distinct symbols via seeded shuffle
  const shuffledSymbols = seededShuffle([...SYMBOLS], rng);
  const chosen = shuffledSymbols.slice(0, pairs);

  // Build array of pairs*2 entries (two of each symbol), then shuffle
  const cards = seededShuffle([...chosen, ...chosen], rng);

  const total = rows * cols;
  const cellStates: CellState[] = Array(total).fill("hidden");

  return {
    settings,
    rows,
    cols,
    symbols: cards,
    state: cellStates,
    firstFlipped: null,
    attempts: 0,
    matched: 0,
    won: false,
    pendingMismatch: null,
  };
}

export function reducer(
  state: MemoryMatchState,
  action: MemoryMatchAction,
): MemoryMatchState {
  switch (action.type) {
    case "dismiss-mismatch": {
      if (!state.pendingMismatch) return state;
      const [a, b] = state.pendingMismatch;
      const newCellState = state.state.slice();
      newCellState[a] = "hidden";
      newCellState[b] = "hidden";
      return { ...state, state: newCellState, pendingMismatch: null };
    }

    case "flip": {
      if (state.won) return state;

      let current = state;

      // Auto-dismiss pending mismatch before processing this flip
      if (current.pendingMismatch) {
        const [a, b] = current.pendingMismatch;
        const newCellState = current.state.slice();
        newCellState[a] = "hidden";
        newCellState[b] = "hidden";
        current = { ...current, state: newCellState, pendingMismatch: null };
      }

      const { index } = action;

      // No-op if cell is not hidden
      if (current.state[index] !== "hidden") return current;

      const newCellState = current.state.slice();
      newCellState[index] = "flipped";

      if (current.firstFlipped === null) {
        // First card of the pair
        return { ...current, state: newCellState, firstFlipped: index };
      }

      // Second card
      const firstIdx = current.firstFlipped;
      const pairs = parseInt(current.settings.size, 10);

      if (current.symbols[index] === current.symbols[firstIdx]) {
        // Match!
        newCellState[firstIdx] = "matched";
        newCellState[index] = "matched";
        const newMatched = current.matched + 1;
        const won = newMatched === pairs;
        return {
          ...current,
          state: newCellState,
          firstFlipped: null,
          attempts: current.attempts + 1,
          matched: newMatched,
          won,
        };
      } else {
        // Mismatch
        return {
          ...current,
          state: newCellState,
          firstFlipped: null,
          attempts: current.attempts + 1,
          pendingMismatch: [firstIdx, index],
        };
      }
    }

    default:
      return state;
  }
}

export function isTerminal(state: MemoryMatchState): { score: number } | null {
  if (!state.won) return null;
  const pairs = parseInt(state.settings.size, 10);
  const score = Math.max(100, pairs * 200 - (state.attempts - pairs) * 20);
  return { score };
}
