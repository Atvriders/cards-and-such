import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TriPeaksCell {
  card: Card;
  removed: boolean;
}

export interface TriPeaksSettings {
  wrapAces: boolean;
}

export interface TriPeaksState {
  settings: TriPeaksSettings;
  rngSeed: number;
  /** 4 rows. Row 0=3 cards, row 1=6 cards, row 2=9 cards, row 3=10 cards. */
  pyramid: readonly (readonly TriPeaksCell[])[];
  stock: readonly Card[];
  waste: readonly Card[];
  currentCard: Card;
  movesMade: number;
  won: boolean;
  lost: boolean;
}

export type TriPeaksAction =
  | { type: "play"; row: number; col: number }
  | { type: "draw" };

export const triPeaksSettings = {
  wrapAces: { kind: "boolean" as const, label: "Aces wrap (A↔K)", default: true },
} as const;

// covers[row][col] = list of (row, col) pairs that must be removed for (row, col) to be free
// Row 0 = top (3 cards), Row 3 = bottom/base (10 cards)
const COVERS: ReadonlyArray<ReadonlyArray<ReadonlyArray<[number, number]>>> = [
  // row 0 (3 cards): col 0 → row 1 cols 0,1; col 1 → row 1 cols 2,3; col 2 → row 1 cols 4,5
  [[[1, 0], [1, 1]], [[1, 2], [1, 3]], [[1, 4], [1, 5]]],
  // row 1 (6 cards):
  //   peak 0: row1.0 → row2.0,row2.1 ;  row1.1 → row2.1,row2.2
  //   peak 1: row1.2 → row2.3,row2.4 ;  row1.3 → row2.4,row2.5
  //   peak 2: row1.4 → row2.6,row2.7 ;  row1.5 → row2.7,row2.8
  [[[2, 0], [2, 1]], [[2, 1], [2, 2]], [[2, 3], [2, 4]], [[2, 4], [2, 5]], [[2, 6], [2, 7]], [[2, 7], [2, 8]]],
  // row 2 (9 cards):
  //   peak 0: row2.0 → row3.0,row3.1 ; row2.1 → row3.1,row3.2 ; row2.2 → row3.2,row3.3
  //   peak 1: row2.3 → row3.3,row3.4 ; row2.4 → row3.4,row3.5 ; row2.5 → row3.5,row3.6
  //   peak 2: row2.6 → row3.6,row3.7 ; row2.7 → row3.7,row3.8 ; row2.8 → row3.8,row3.9
  [
    [[3, 0], [3, 1]], [[3, 1], [3, 2]], [[3, 2], [3, 3]],
    [[3, 3], [3, 4]], [[3, 4], [3, 5]], [[3, 5], [3, 6]],
    [[3, 6], [3, 7]], [[3, 7], [3, 8]], [[3, 8], [3, 9]],
  ],
  // row 3 (10 cards): no covers
  [[], [], [], [], [], [], [], [], [], []],
];

/** A pyramid card is uncovered when all its COVERS entries are removed (or row 3 always free). */
export function isUncovered(pyramid: readonly (readonly TriPeaksCell[])[], row: number, col: number): boolean {
  const cell = pyramid[row]?.[col];
  if (!cell || cell.removed) return false;

  const covers = COVERS[row]?.[col];
  if (!covers) return true; // No covers defined = uncovered

  for (const [cr, cc] of covers) {
    const coverCell = pyramid[cr]?.[cc];
    if (coverCell && !coverCell.removed) {
      return false; // Still covered
    }
  }
  return true;
}

export function ranksAdjacent(a: number, b: number, wrap: boolean): boolean {
  if (Math.abs(a - b) === 1) return true;
  if (wrap && ((a === 1 && b === 13) || (a === 13 && b === 1))) return true;
  return false;
}

function isWon(pyramid: readonly (readonly TriPeaksCell[])[]): boolean {
  for (const row of pyramid) {
    for (const cell of row) {
      if (!cell.removed) return false;
    }
  }
  return true;
}

function countRemoved(pyramid: readonly (readonly TriPeaksCell[])[]): number {
  let count = 0;
  for (const row of pyramid) {
    for (const cell of row) {
      if (cell.removed) count++;
    }
  }
  return count;
}

function hasValidMoves(state: TriPeaksState): boolean {
  if (state.stock.length > 0) return true;

  // Check if any uncovered card is playable
  for (let r = 0; r < 4; r++) {
    const rowLen = state.pyramid[r]?.length ?? 0;
    for (let c = 0; c < rowLen; c++) {
      if (isUncovered(state.pyramid, r, c)) {
        const cell = state.pyramid[r]![c]!;
        if (ranksAdjacent(cell.card.rank, state.currentCard.rank, state.settings.wrapAces)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function initialState(seed: number, settings: TriPeaksSettings): TriPeaksState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Row sizes: 3, 6, 9, 10 = 28 pyramid cards
  const rowSizes = [3, 6, 9, 10];
  const pyramid: TriPeaksCell[][] = [];
  let idx = 0;
  for (const size of rowSizes) {
    const row: TriPeaksCell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({ card: deck[idx++]!, removed: false });
    }
    pyramid.push(row);
  }

  // Remaining 24 cards → stock; first draw one as currentCard
  const stockCards = deck.slice(28);
  // Top of stock (last element) becomes first currentCard
  const currentCard = stockCards[stockCards.length - 1]!;
  const stock = stockCards.slice(0, -1);
  const waste = [currentCard];

  return {
    settings,
    rngSeed: seed,
    pyramid,
    stock,
    waste,
    currentCard,
    movesMade: 0,
    won: false,
    lost: false,
  };
}

export function reducer(state: TriPeaksState, action: TriPeaksAction): TriPeaksState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "play": {
      const { row, col } = action;
      const cell = state.pyramid[row]?.[col];
      if (!cell || cell.removed) return state;

      if (!isUncovered(state.pyramid, row, col)) return state;
      if (!ranksAdjacent(cell.card.rank, state.currentCard.rank, state.settings.wrapAces)) return state;

      // Mark removed
      const newPyramid = state.pyramid.map((r, ri) =>
        ri === row
          ? r.map((c, ci) => (ci === col ? { ...c, removed: true } : c))
          : r,
      );

      const newCurrentCard = cell.card;
      const newWaste = [...state.waste, cell.card];

      const won = isWon(newPyramid);
      const next: TriPeaksState = {
        ...state,
        pyramid: newPyramid,
        waste: newWaste,
        currentCard: newCurrentCard,
        movesMade: state.movesMade + 1,
        won,
      };
      if (won) return next;
      const lost = !hasValidMoves(next);
      return { ...next, lost };
    }

    case "draw": {
      if (state.stock.length === 0) {
        // Check lost
        const lost = !hasValidMoves(state);
        return lost ? { ...state, lost } : state;
      }
      const newStock = state.stock.slice(0, -1);
      const drawn = state.stock[state.stock.length - 1]!;
      const newWaste = [...state.waste, drawn];
      const next: TriPeaksState = {
        ...state,
        stock: newStock,
        waste: newWaste,
        currentCard: drawn,
      };
      const lost = !hasValidMoves(next);
      return { ...next, lost };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TriPeaksState): { score: number } | null {
  if (!state.won && !state.lost) return null;

  if (state.won) {
    const score = 500 + state.stock.length * 5;
    return { score };
  }

  // Lost
  const removedCount = countRemoved(state.pyramid);
  return { score: removedCount * 20 };
}
