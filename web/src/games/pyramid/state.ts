import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Cell = { card: Card; removed: boolean } | null;

export interface PyramidSettings {
  redeals: "0" | "1" | "3";
}

export interface PyramidState {
  settings: PyramidSettings;
  rngSeed: number;
  pyramid: readonly (readonly Cell[])[];
  stock: readonly Card[];
  waste: readonly Card[];
  redealsRemaining: number;
  selected: { kind: "pyramid"; row: number; col: number } | { kind: "waste" } | null;
  movesMade: number;
  won: boolean;
  lost: boolean;
}

export type PyramidAction =
  | { type: "select"; source: { kind: "pyramid"; row: number; col: number } | { kind: "waste" } }
  | { type: "remove-king"; source: { kind: "pyramid"; row: number; col: number } | { kind: "waste" } }
  | { type: "draw" }
  | { type: "redeal" };

export const pyramidSettings = {
  redeals: { kind: "enum" as const, label: "Redeals", options: ["0", "1", "3"] as const, default: "3" as const },
} as const;

// Row lengths: [1, 2, 3, 4, 5, 6, 7]
const ROW_SIZES = [1, 2, 3, 4, 5, 6, 7];

/** A card in row `r`, col `c` is covered if row r+1 has cells (r+1, c) and (r+1, c+1) that are not removed. */
export function isAvailablePyramid(pyramid: readonly (readonly Cell[])[], row: number, col: number): boolean {
  const cell = pyramid[row]?.[col];
  if (!cell || cell.removed) return false;

  // Last row (row 6) is always uncovered
  if (row === 6) return true;

  // Check if both covering cells are removed
  const below1 = pyramid[row + 1]?.[col];
  const below2 = pyramid[row + 1]?.[col + 1];

  const cleared1 = !below1 || below1.removed;
  const cleared2 = !below2 || below2.removed;

  return cleared1 && cleared2;
}

function getCardAtSource(
  state: PyramidState,
  source: { kind: "pyramid"; row: number; col: number } | { kind: "waste" },
): Card | null {
  if (source.kind === "waste") {
    if (state.waste.length === 0) return null;
    return state.waste[state.waste.length - 1]!;
  }
  const cell = state.pyramid[source.row]?.[source.col];
  if (!cell || cell.removed) return null;
  return cell.card;
}

function removeCellAt(
  pyramid: readonly (readonly Cell[])[],
  row: number,
  col: number,
): (readonly Cell[])[] {
  return pyramid.map((r, ri) =>
    ri === row
      ? r.map((c, ci) => (ci === col && c ? { ...c, removed: true } : c))
      : r,
  );
}

function countRemovedPyramid(pyramid: readonly (readonly Cell[])[]): number {
  let count = 0;
  for (const row of pyramid) {
    for (const cell of row) {
      if (cell && cell.removed) count++;
    }
  }
  return count;
}

function isWon(pyramid: readonly (readonly Cell[])[]): boolean {
  for (const row of pyramid) {
    for (const cell of row) {
      if (cell && !cell.removed) return false;
    }
  }
  return true;
}

/** Collect all available cards (card + rank) to check if any pair sums to 13. */
function hasValidMoves(state: PyramidState): boolean {
  const available: Card[] = [];

  // Pyramid available cards
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < ROW_SIZES[r]!; c++) {
      if (isAvailablePyramid(state.pyramid, r, c)) {
        const cell = state.pyramid[r]![c]!;
        available.push(cell.card);
      }
    }
  }

  // Top of waste
  if (state.waste.length > 0) {
    available.push(state.waste[state.waste.length - 1]!);
  }

  // Top of stock (can be drawn)
  if (state.stock.length > 0) {
    return true; // Can always draw if stock non-empty
  }

  // Check for kings (solo removal)
  for (const card of available) {
    if (card.rank === 13) return true;
  }

  // Check for pairs summing to 13
  for (let i = 0; i < available.length; i++) {
    for (let j = i + 1; j < available.length; j++) {
      if (available[i]!.rank + available[j]!.rank === 13) return true;
    }
  }

  // Check redeals
  if (state.redealsRemaining > 0 && state.waste.length > 0) return true;

  return false;
}

export function initialState(seed: number, settings: PyramidSettings): PyramidState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Build pyramid: 1+2+3+4+5+6+7 = 28 cards
  const pyramid: (Cell[])[] = [];
  let idx = 0;
  for (const size of ROW_SIZES) {
    const row: Cell[] = [];
    for (let c = 0; c < size; c++) {
      const card = deck[idx++]!;
      row.push({ card, removed: false });
    }
    pyramid.push(row);
  }

  // Remaining 24 cards form the stock
  const stock = deck.slice(28);

  const redealsRemaining = parseInt(settings.redeals, 10);

  return {
    settings,
    rngSeed: seed,
    pyramid,
    stock,
    waste: [],
    redealsRemaining,
    selected: null,
    movesMade: 0,
    won: false,
    lost: false,
  };
}

export function reducer(state: PyramidState, action: PyramidAction): PyramidState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = state.stock.slice(0, -1);
      const drawn = state.stock[state.stock.length - 1]!;
      const newWaste = [...state.waste, drawn];
      const next: PyramidState = {
        ...state,
        stock: newStock,
        waste: newWaste,
        selected: null,
      };
      const lost = !hasValidMoves(next);
      return { ...next, lost };
    }

    case "redeal": {
      if (state.stock.length > 0) return state;
      if (state.redealsRemaining <= 0) return state;
      if (state.waste.length === 0) return state;
      const newStock = [...state.waste].reverse();
      const next: PyramidState = {
        ...state,
        stock: newStock,
        waste: [],
        redealsRemaining: state.redealsRemaining - 1,
        selected: null,
      };
      const lost = !hasValidMoves(next);
      return { ...next, lost };
    }

    case "remove-king": {
      const { source } = action;
      const card = getCardAtSource(state, source);
      if (!card || card.rank !== 13) return state;

      // Check availability
      if (source.kind === "pyramid") {
        if (!isAvailablePyramid(state.pyramid, source.row, source.col)) return state;
      }

      let newPyramid = state.pyramid;
      let newWaste = state.waste;

      if (source.kind === "pyramid") {
        newPyramid = removeCellAt(state.pyramid, source.row, source.col);
      } else {
        // Remove top of waste
        newWaste = state.waste.slice(0, -1);
      }

      const won = isWon(newPyramid);
      const next: PyramidState = {
        ...state,
        pyramid: newPyramid,
        waste: newWaste,
        selected: null,
        movesMade: state.movesMade + 1,
        won,
      };
      if (won) return next;
      const lost = !hasValidMoves(next);
      return { ...next, lost };
    }

    case "select": {
      const { source } = action;

      // Check availability
      if (source.kind === "pyramid") {
        if (!isAvailablePyramid(state.pyramid, source.row, source.col)) return state;
        const cell = state.pyramid[source.row]?.[source.col];
        if (!cell || cell.removed) return state;
      } else {
        if (state.waste.length === 0) return state;
      }

      // If king, auto-remove
      const card = getCardAtSource(state, source);
      if (!card) return state;
      if (card.rank === 13) {
        return reducer(state, { type: "remove-king", source });
      }

      // If there's an existing selection, try to pair
      if (state.selected !== null) {
        const prevCard = getCardAtSource(state, state.selected);
        if (prevCard && prevCard.rank + card.rank === 13) {
          // Valid pair — remove both
          let newPyramid = state.pyramid;
          let newWaste = state.waste;

          // Remove previous selection
          if (state.selected.kind === "pyramid") {
            // Make sure it's still available (might have been blocked)
            if (!isAvailablePyramid(state.pyramid, state.selected.row, state.selected.col)) {
              // Re-select new source
              return { ...state, selected: source };
            }
            newPyramid = removeCellAt(newPyramid, state.selected.row, state.selected.col);
          } else {
            // Remove top of waste
            newWaste = newWaste.slice(0, -1);
          }

          // Remove current selection
          if (source.kind === "pyramid") {
            // Apply any waste removal first, then check pyramid availability
            const tempState = { ...state, pyramid: newPyramid, waste: newWaste };
            if (!isAvailablePyramid(tempState.pyramid, source.row, source.col)) {
              // Re-select just the new source
              return { ...state, selected: source };
            }
            newPyramid = removeCellAt(newPyramid, source.row, source.col);
          } else {
            newWaste = newWaste.slice(0, -1);
          }

          const won = isWon(newPyramid);
          const next: PyramidState = {
            ...state,
            pyramid: newPyramid,
            waste: newWaste,
            selected: null,
            movesMade: state.movesMade + 1,
            won,
          };
          if (won) return next;
          const lost = !hasValidMoves(next);
          return { ...next, lost };
        }
      }

      // Set (or replace) selection
      return { ...state, selected: source };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PyramidState): { score: number } | null {
  if (!state.won && !state.lost) return null;

  if (state.won) {
    const removedBonus = 28 - state.movesMade;
    const score = Math.max(100, 500 + state.redealsRemaining * 100 + removedBonus);
    return { score };
  }

  // Lost
  const removedCount = countRemovedPyramid(state.pyramid);
  return { score: removedCount * 10 };
}
