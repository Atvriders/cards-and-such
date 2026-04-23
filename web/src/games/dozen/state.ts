import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Dozen solitaire:
 * Remove all 4 Kings from the deck (48 cards remain).
 * Deal into 12 columns × 4 cards each, all face-up.
 * 4 foundations pre-loaded with the 4 Aces, built up same-suit.
 * Remove pairs of same-rank from column tops, OR move top cards to foundations.
 * Win = all foundations have 12 cards each (Ace through Queen, no Kings).
 */

export interface DozenSettings {
  _dummy?: undefined;
}

export interface DozenState {
  foundations: Card[][];
  columns: Card[][];
  selected: number | null; // column index
  removedPairs: number;
  movesMade: number;
  won: boolean;
  lost: boolean;
  settings: DozenSettings;
}

export type DozenAction =
  | { type: "select-column"; colIdx: number }
  | { type: "move-to-foundation"; colIdx: number; foundationIdx: number };

const FOUNDATION_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function initialState(seed: number, settings: DozenSettings): DozenState {
  const rng = mulberry32(seed);
  // Remove Kings from a fresh deck
  const fullDeck = newDeck();
  const noKings = fullDeck.filter((c) => c.rank !== 13);
  // Shuffle only non-king, non-ace cards for dealing; aces go to foundations
  const aces = noKings.filter((c) => c.rank === 1);
  const rest = noKings.filter((c) => c.rank !== 1);
  const shuffledRest = shuffle(rest, rng);

  // 4 foundations start with aces
  const foundations: Card[][] = FOUNDATION_SUITS.map((suit) => {
    const ace = aces.find((a) => a.suit === suit)!;
    return [ace];
  });

  // 12 columns × 4 cards each (48 cards used, but we have 44 non-ace non-king)
  // Actually: 52 - 4 kings - 4 aces = 44 remaining, deal into 11 columns × 4 = 44
  // Spec says 12 cols × 4, so include aces in deal or adjust
  // Let's re-read spec: "Remove all 4 Kings. 48 remaining dealt into 12 columns × 4 cards"
  // 48 = 52 - 4 kings. Aces are in the 48, foundations pre-loaded with aces.
  // So deal all 48 including aces? But foundations have aces...
  // Interpretation: deal 48 fresh cards (no kings), put aces on foundations separately,
  // and deal remaining 44 cards... that doesn't give 12×4=48.
  // Best interpretation: 12 columns × 4 = 48 cards (no kings), foundations start EMPTY with aces added,
  // OR the foundations start empty and aces are dealt to columns.
  // We'll go with: foundations pre-loaded with aces (4 cards), 44 cards in 11 columns of 4.
  // But spec says 12 cols. So let's just deal all 48 (including aces) to 12 cols of 4,
  // and separately place aces on foundations as they appear. Actually simplest: no ace pre-loading,
  // just play normally. But spec says "4 foundations pre-loaded with 4 Aces".
  // Resolution: 52 - 4 kings = 48. Deal all 48 to 12 cols × 4. Foundations START EMPTY.
  // As a special deal step, move aces from columns to foundations immediately.

  const all48 = shuffle(noKings, rng); // re-shuffle all non-kings
  const cols: Card[][] = [];
  for (let i = 0; i < 12; i++) {
    cols.push(all48.slice(i * 4, i * 4 + 4));
  }

  // Auto-move aces from column tops to foundations
  const autoFoundations: Card[][] = FOUNDATION_SUITS.map(() => []);
  const autoCols = cols.map((col) => [...col]);

  for (let fIdx = 0; fIdx < 4; fIdx++) {
    const suit = FOUNDATION_SUITS[fIdx]!;
    for (let cIdx = 0; cIdx < 12; cIdx++) {
      const col = autoCols[cIdx]!;
      // Check from top
      for (let pos = col.length - 1; pos >= 0; pos--) {
        if (col[pos]!.suit === suit && col[pos]!.rank === 1) {
          // Move ace to foundation (remove from column)
          const ace = col.splice(pos, 1)[0]!;
          autoFoundations[fIdx]!.push(ace);
          break;
        }
      }
    }
  }

  return {
    foundations: autoFoundations,
    columns: autoCols,
    selected: null,
    removedPairs: 0,
    movesMade: 0,
    won: false,
    lost: false,
    settings,
  };
}

function hasValidMoves(foundations: Card[][], columns: Card[][]): boolean {
  // Check foundation moves
  for (let cIdx = 0; cIdx < columns.length; cIdx++) {
    const col = columns[cIdx]!;
    if (col.length === 0) continue;
    const top = col[col.length - 1]!;
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      const f = foundations[fIdx]!;
      const fTop = f.length > 0 ? f[f.length - 1]! : null;
      if (!fTop && top.rank === 1) return true;
      if (fTop && fTop.suit === top.suit && top.rank === fTop.rank + 1) return true;
    }
  }

  // Check pair removal
  const topRankCount: Record<number, number> = {};
  for (const col of columns) {
    if (col.length === 0) continue;
    const r = col[col.length - 1]!.rank;
    topRankCount[r] = (topRankCount[r] ?? 0) + 1;
    if (topRankCount[r]! >= 2) return true;
  }

  return false;
}

export function reducer(state: DozenState, action: DozenAction): DozenState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "select-column": {
      const { colIdx } = action;
      const col = state.columns[colIdx];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;

      if (state.selected === null) {
        return { ...state, selected: colIdx };
      }

      if (state.selected === colIdx) {
        return { ...state, selected: null };
      }

      // Try to pair
      const prevCol = state.columns[state.selected]!;
      if (prevCol.length === 0) return { ...state, selected: colIdx };
      const prevCard = prevCol[prevCol.length - 1]!;

      if (prevCard.rank !== card.rank) {
        return { ...state, selected: colIdx };
      }

      // Remove pair
      const newColumns = state.columns.map((c, i) => {
        if (i === state.selected || i === colIdx) return c.slice(0, -1);
        return [...c];
      });

      const newRemovedPairs = state.removedPairs + 1;
      const totalFoundation = state.foundations.reduce((s, f) => s + f.length, 0);
      const won = totalFoundation === 48 && newColumns.every((c) => c.length === 0);

      const next: DozenState = {
        ...state,
        columns: newColumns,
        selected: null,
        removedPairs: newRemovedPairs,
        movesMade: state.movesMade + 1,
        won,
      };

      if (won) return next;
      return { ...next, lost: !hasValidMoves(next.foundations, next.columns) };
    }

    case "move-to-foundation": {
      const { colIdx, foundationIdx } = action;
      const col = state.columns[colIdx];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;

      const foundation = state.foundations[foundationIdx]!;
      const fTop = foundation.length > 0 ? foundation[foundation.length - 1]! : null;

      const canPlace =
        (!fTop && card.rank === 1 && card.suit === FOUNDATION_SUITS[foundationIdx]) ||
        (fTop && fTop.suit === card.suit && card.rank === fTop.rank + 1);

      if (!canPlace) return state;

      const newColumns = state.columns.map((c, i) => i === colIdx ? c.slice(0, -1) : [...c]);
      const newFoundations = state.foundations.map((f, i) => i === foundationIdx ? [...f, card] : [...f]);

      const totalFoundation = newFoundations.reduce((s, f) => s + f.length, 0);
      const won = totalFoundation === 48;

      const next: DozenState = {
        ...state,
        columns: newColumns,
        foundations: newFoundations,
        selected: null,
        movesMade: state.movesMade + 1,
        won,
      };

      if (won) return next;
      return { ...next, lost: !hasValidMoves(next.foundations, next.columns) };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DozenState): { score: number } | null {
  if (!state.won && !state.lost) return null;
  const total = state.foundations.reduce((s, f) => s + f.length, 0);
  return { score: total * 10 + state.removedPairs * 5 };
}
