import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MonteCarloSettings {
  _dummy?: undefined;
}

/**
 * Monte Carlo solitaire.
 *
 * 25-card grid (5×5). Remove pairs of same-rank adjacent (including diagonal) cards.
 * After removal, compact grid left-to-right top-to-bottom, fill from stock.
 * Win: remove all 52 cards (all removed when stock is empty and grid is empty).
 */
export interface MonteCarloState {
  /** Grid of 25 positions. null = empty. Index 0 = top-left, 24 = bottom-right. */
  grid: (Card | null)[];
  /** Remaining stock (not yet dealt to the grid). */
  stock: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: MonteCarloSettings;
}

export type MonteCarloAction =
  | { type: "select-pair"; pos1: number; pos2: number };

function isAdjacent(pos1: number, pos2: number): boolean {
  const row1 = Math.floor(pos1 / 5);
  const col1 = pos1 % 5;
  const row2 = Math.floor(pos2 / 5);
  const col2 = pos2 % 5;
  return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1 && pos1 !== pos2;
}

/** Compact grid: slide non-null cards left-and-up, then fill vacated spots from stock. */
function compactAndFill(grid: (Card | null)[], stock: Card[]): { grid: (Card | null)[]; stock: Card[] } {
  const cards = grid.filter((c): c is Card => c !== null);
  const newStock = [...stock];
  const newGrid: (Card | null)[] = [...cards];
  // Fill up to 25 positions from stock
  while (newGrid.length < 25 && newStock.length > 0) {
    newGrid.push(newStock.pop()!);
  }
  // Pad with nulls
  while (newGrid.length < 25) {
    newGrid.push(null);
  }
  return { grid: newGrid, stock: newStock };
}

export function initialState(seed: number, settings: MonteCarloSettings): MonteCarloState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal 25 cards to grid
  const grid: (Card | null)[] = deck.slice(0, 25);
  const stock = [...deck.slice(25)].reverse(); // stock top = last element

  return {
    grid,
    stock,
    score: 0,
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: MonteCarloState, action: MonteCarloAction): MonteCarloState {
  if (state.won) return state;

  switch (action.type) {
    case "select-pair": {
      const { pos1, pos2 } = action;
      if (pos1 < 0 || pos1 >= 25 || pos2 < 0 || pos2 >= 25) return state;
      const c1 = state.grid[pos1];
      const c2 = state.grid[pos2];
      if (!c1 || !c2) return state;
      if (c1.rank !== c2.rank) return state;
      if (!isAdjacent(pos1, pos2)) return state;

      const newGrid = [...state.grid];
      newGrid[pos1] = null;
      newGrid[pos2] = null;

      const { grid: compacted, stock: newStock } = compactAndFill(newGrid, state.stock);

      const won = compacted.every((c) => c === null) && newStock.length === 0;

      return {
        ...state,
        grid: compacted,
        stock: newStock,
        score: state.score + 2,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MonteCarloState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
