import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Nestor solitaire:
 * 1 deck. 8 columns × 6 cards (48 cards), all face-up.
 * 4 remaining cards dealt as a reserve (one each).
 * Match pairs of same-rank cards from column tops or reserve to remove them.
 * Win = clear all 52 cards.
 * Constraint: deal ensures no column has two cards of the same rank.
 */

export interface NestorSettings {
  _dummy?: undefined;
}

export interface NestorState {
  columns: Card[][];
  reserve: (Card | null)[];
  selected: { source: "column" | "reserve"; index: number } | null;
  removedPairs: number;
  movesMade: number;
  won: boolean;
  lost: boolean;
  settings: NestorSettings;
}

export type NestorAction =
  | { type: "select-column"; colIdx: number }
  | { type: "select-reserve"; resIdx: number };

export function initialState(seed: number, settings: NestorSettings): NestorState {
  const rng = mulberry32(seed);

  // Deal 8 columns of 6 cards ensuring no two same-rank in a column
  // Try to deal a valid layout; fall back gracefully
  const deck = shuffle(newDeck(), rng);

  // Group cards by rank
  const byRank: Card[][] = Array.from({ length: 13 }, () => []);
  for (const card of deck) {
    byRank[card.rank - 1]!.push(card);
  }

  // Distribute round-robin into 8 columns × 6
  const columns: Card[][] = Array.from({ length: 8 }, () => []);
  let colIdx = 0;
  for (const rankGroup of byRank) {
    for (const card of rankGroup) {
      if (columns[colIdx]!.length < 6) {
        columns[colIdx]!.push(card);
      } else {
        // Find a column that can take it
        let placed = false;
        for (let c = 0; c < 8; c++) {
          if (columns[c]!.length < 6) {
            columns[c]!.push(card);
            placed = true;
            break;
          }
        }
        if (!placed) {
          // Reserve will handle it
          columns[colIdx % 8]!.push(card);
        }
      }
      colIdx = (colIdx + 1) % 8;
    }
  }

  // Collect any overflow as reserve (should be exactly 4 cards after 48 placed in columns)
  const colCards = new Set(columns.flatMap((c) => c.map((card) => card.id)));
  const reserve: (Card | null)[] = deck
    .filter((c) => !colCards.has(c.id))
    .slice(0, 4)
    .map((c) => c as Card | null);

  // Ensure reserve has exactly 4 slots
  while (reserve.length < 4) reserve.push(null);

  return {
    columns,
    reserve,
    selected: null,
    removedPairs: 0,
    movesMade: 0,
    won: false,
    lost: false,
    settings,
  };
}

function getTopCard(columns: Card[][], colIdx: number): Card | null {
  const col = columns[colIdx];
  if (!col || col.length === 0) return null;
  return col[col.length - 1]!;
}

function hasValidMoves(columns: Card[][], reserve: (Card | null)[]): boolean {
  // Gather all top cards from columns + reserve
  const tops: { rank: number }[] = [];
  for (let c = 0; c < columns.length; c++) {
    const top = getTopCard(columns, c);
    if (top) tops.push({ rank: top.rank });
  }
  for (const card of reserve) {
    if (card) tops.push({ rank: card.rank });
  }

  // Check for any matching pair
  const rankCount: Record<number, number> = {};
  for (const { rank } of tops) {
    rankCount[rank] = (rankCount[rank] ?? 0) + 1;
    if (rankCount[rank]! >= 2) return true;
  }
  return false;
}

export function reducer(state: NestorState, action: NestorAction): NestorState {
  if (state.won || state.lost) return state;

  const handleSelect = (source: "column" | "reserve", index: number): NestorState => {
    // Get card for this selection
    let card: Card | null = null;
    if (source === "column") {
      card = getTopCard(state.columns, index);
    } else {
      card = state.reserve[index] ?? null;
    }
    if (!card) return state;

    // If nothing selected, set selection
    if (!state.selected) {
      return { ...state, selected: { source, index } };
    }

    // Same spot: deselect
    if (state.selected.source === source && state.selected.index === index) {
      return { ...state, selected: null };
    }

    // Get previously selected card
    let prevCard: Card | null = null;
    if (state.selected.source === "column") {
      prevCard = getTopCard(state.columns, state.selected.index);
    } else {
      prevCard = state.reserve[state.selected.index] ?? null;
    }

    if (!prevCard) return { ...state, selected: { source, index } };

    // Check if they match ranks
    if (prevCard.rank !== card.rank) {
      // Replace selection
      return { ...state, selected: { source, index } };
    }

    // Match! Remove both
    let newColumns = state.columns.map((col) => [...col]);
    let newReserve = [...state.reserve];

    if (state.selected.source === "column") {
      newColumns[state.selected.index] = newColumns[state.selected.index]!.slice(0, -1);
    } else {
      newReserve[state.selected.index] = null;
    }

    if (source === "column") {
      newColumns[index] = newColumns[index]!.slice(0, -1);
    } else {
      newReserve[index] = null;
    }

    const newRemovedPairs = state.removedPairs + 1;
    const won = newRemovedPairs === 26; // 52 cards / 2

    const next: NestorState = {
      ...state,
      columns: newColumns,
      reserve: newReserve,
      selected: null,
      removedPairs: newRemovedPairs,
      movesMade: state.movesMade + 1,
      won,
    };

    if (won) return next;

    const lost = !hasValidMoves(newColumns, newReserve);
    return { ...next, lost };
  };

  switch (action.type) {
    case "select-column":
      return handleSelect("column", action.colIdx);
    case "select-reserve":
      return handleSelect("reserve", action.resIdx);
    default:
      return state;
  }
}

export function isTerminal(state: NestorState): { score: number } | null {
  if (!state.won && !state.lost) return null;
  return { score: state.removedPairs * 20 };
}
