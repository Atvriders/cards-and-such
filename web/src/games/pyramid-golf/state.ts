import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Pyramid Golf hybrid:
 * - 1 deck, 28-card pyramid (7 rows), stock of 24 cards.
 * - Remove pyramid cards either by:
 *   (a) Pairing with waste top to sum to 13 (Pyramid rule), OR
 *   (b) Being one rank up or down from the waste top (Golf rule).
 * - Kings (rank 13) can be removed solo (Pyramid rule).
 * - Win = clear all 28 pyramid cards.
 */

export type PyramidCell = { card: Card; removed: boolean } | null;

export interface PyramidGolfSettings {
  _dummy?: undefined;
}

export interface PyramidGolfState {
  pyramid: PyramidCell[][];
  stock: Card[];
  waste: Card[];
  /** Currently selected pyramid card (for pairing) */
  selected: { row: number; col: number } | null;
  movesMade: number;
  won: boolean;
  lost: boolean;
  settings: PyramidGolfSettings;
}

export type PyramidGolfAction =
  | { type: "draw" }
  | { type: "select-pyramid"; row: number; col: number }
  | { type: "remove-king"; row: number; col: number };

const ROW_SIZES = [1, 2, 3, 4, 5, 6, 7];

export function isAvailable(pyramid: PyramidCell[][], row: number, col: number): boolean {
  const cell = pyramid[row]?.[col];
  if (!cell || cell.removed) return false;
  if (row === 6) return true;
  const b1 = pyramid[row + 1]?.[col];
  const b2 = pyramid[row + 1]?.[col + 1];
  return (!b1 || b1.removed) && (!b2 || b2.removed);
}

function pyramidCleared(pyramid: PyramidCell[][]): boolean {
  return pyramid.every((row) => row.every((cell) => !cell || cell.removed));
}

function removeCell(pyramid: PyramidCell[][], row: number, col: number): PyramidCell[][] {
  return pyramid.map((r, ri) =>
    ri === row ? r.map((c, ci) => (ci === col && c ? { ...c, removed: true } : c)) : r
  );
}

function hasValidMoves(state: PyramidGolfState): boolean {
  if (state.stock.length > 0) return true;
  if (state.waste.length === 0) return false;

  const wasteTop = state.waste[state.waste.length - 1]!;
  const wRank = wasteTop.rank as number;

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < ROW_SIZES[r]!; c++) {
      if (!isAvailable(state.pyramid, r, c)) continue;
      const card = state.pyramid[r]![c]!.card;
      const rank = card.rank as number;
      // Pyramid rule: sum to 13, or king
      if (rank === 13) return true;
      if (rank + wRank === 13) return true;
      // Golf rule: one rank up or down
      if (Math.abs(rank - wRank) === 1) return true;
    }
  }
  return false;
}

export function initialState(seed: number, settings: PyramidGolfSettings): PyramidGolfState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const pyramid: PyramidCell[][] = [];
  let idx = 0;
  for (const size of ROW_SIZES) {
    const row: PyramidCell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({ card: deck[idx++]!, removed: false });
    }
    pyramid.push(row);
  }

  // 24 remaining in stock; first one goes to waste to start the chain
  const remaining = deck.slice(28);
  const firstWaste = remaining[remaining.length - 1]!;
  const stock = remaining.slice(0, -1);

  return {
    pyramid,
    stock,
    waste: [firstWaste],
    selected: null,
    movesMade: 0,
    won: false,
    lost: false,
    settings,
  };
}

export function reducer(state: PyramidGolfState, action: PyramidGolfAction): PyramidGolfState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const card = state.stock[state.stock.length - 1]!;
      const newStock = state.stock.slice(0, -1);
      const newWaste = [...state.waste, card];
      const next: PyramidGolfState = { ...state, stock: newStock, waste: newWaste, selected: null, movesMade: state.movesMade + 1 };
      return { ...next, lost: !hasValidMoves(next) };
    }

    case "remove-king": {
      const { row, col } = action;
      if (!isAvailable(state.pyramid, row, col)) return state;
      const cell = state.pyramid[row]![col]!;
      if (cell.card.rank !== 13) return state;

      const newPyramid = removeCell(state.pyramid, row, col);
      const won = pyramidCleared(newPyramid);
      const next: PyramidGolfState = { ...state, pyramid: newPyramid, selected: null, movesMade: state.movesMade + 1, won };
      if (won) return next;
      return { ...next, lost: !hasValidMoves(next) };
    }

    case "select-pyramid": {
      const { row, col } = action;
      if (!isAvailable(state.pyramid, row, col)) return state;
      const cell = state.pyramid[row]![col]!;
      const card = cell.card;

      // King: auto-remove
      if (card.rank === 13) {
        return reducer(state, { type: "remove-king", row, col });
      }

      if (state.waste.length === 0) return { ...state, selected: { row, col } };

      const wasteTop = state.waste[state.waste.length - 1]!;
      const wRank = wasteTop.rank as number;
      const cRank = card.rank as number;

      const canPairSum13 = cRank + wRank === 13;
      const canGolfStep = Math.abs(cRank - wRank) === 1;

      if (canPairSum13 || canGolfStep) {
        // If there's a selection and it pairs with this for sum-to-13 — also try that
        if (state.selected) {
          const prevCell = state.pyramid[state.selected.row]![state.selected.col];
          if (prevCell && !prevCell.removed && isAvailable(state.pyramid, state.selected.row, state.selected.col)) {
            const prevRank = prevCell.card.rank as number;
            if (prevRank + cRank === 13) {
              let np = removeCell(state.pyramid, state.selected.row, state.selected.col);
              np = removeCell(np, row, col);
              const won = pyramidCleared(np);
              const next: PyramidGolfState = { ...state, pyramid: np, selected: null, movesMade: state.movesMade + 1, won };
              if (won) return next;
              return { ...next, lost: !hasValidMoves(next) };
            }
          }
        }
        // Play onto waste (Golf or Pyramid single rule)
        const newPyramid = removeCell(state.pyramid, row, col);
        const newWaste = [...state.waste, card];
        const won = pyramidCleared(newPyramid);
        const next: PyramidGolfState = { ...state, pyramid: newPyramid, waste: newWaste, selected: null, movesMade: state.movesMade + 1, won };
        if (won) return next;
        return { ...next, lost: !hasValidMoves(next) };
      }

      // Try pairing with selection
      if (state.selected) {
        const prevCell = state.pyramid[state.selected.row]![state.selected.col];
        if (prevCell && !prevCell.removed && isAvailable(state.pyramid, state.selected.row, state.selected.col)) {
          const prevRank = prevCell.card.rank as number;
          if (prevRank + cRank === 13) {
            let np = removeCell(state.pyramid, state.selected.row, state.selected.col);
            np = removeCell(np, row, col);
            const won = pyramidCleared(np);
            const next: PyramidGolfState = { ...state, pyramid: np, selected: null, movesMade: state.movesMade + 1, won };
            if (won) return next;
            return { ...next, lost: !hasValidMoves(next) };
          }
        }
      }

      return { ...state, selected: { row, col } };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PyramidGolfState): { score: number } | null {
  if (!state.won && !state.lost) return null;
  if (state.won) return { score: 500 + (state.stock.length * 10) };
  // Count removed cells as partial score
  let removed = 0;
  for (const row of state.pyramid) {
    for (const cell of row) {
      if (cell && cell.removed) removed++;
    }
  }
  return { score: removed * 10 };
}
