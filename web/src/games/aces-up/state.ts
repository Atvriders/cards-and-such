import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AcesUpSettings {
  _dummy?: undefined;
}

export interface AcesUpState {
  /** 4 tableau columns (arrays, last = top). */
  columns: Card[][];
  /** Remaining stock (dealt 4 at a time). */
  stock: Card[];
  /** Discarded cards (removed low cards). */
  discarded: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type AcesUpAction =
  | { type: "deal" }
  | { type: "discard-lowers" }
  | { type: "move-to-empty"; fromCol: number; toCol: number };

function rankForAcesHigh(rank: number): number {
  return rank === 1 ? 14 : rank; // Ace is high
}

/** Find which column tops can be removed because another top of the same suit outranks them. */
export function findDiscardable(columns: Card[][]): number[] {
  const tops: Array<{ col: number; card: Card } | null> = columns.map((col, i) =>
    col.length > 0 ? { col: i, card: col[col.length - 1]! } : null,
  );

  // Group tops by suit
  const bySuit = new Map<Suit, Array<{ col: number; rank: number }>>();
  for (const top of tops) {
    if (!top) continue;
    const { col, card } = top;
    if (!bySuit.has(card.suit)) bySuit.set(card.suit, []);
    bySuit.get(card.suit)!.push({ col, rank: rankForAcesHigh(card.rank) });
  }

  const discardable: number[] = [];
  for (const group of bySuit.values()) {
    if (group.length < 2) continue;
    const maxRank = Math.max(...group.map((g) => g.rank));
    for (const { col, rank } of group) {
      if (rank < maxRank) discardable.push(col);
    }
  }
  return discardable;
}

export function initialState(seed: number, _settings: AcesUpSettings): AcesUpState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal 4 cards initially (one per column)
  const columns: Card[][] = [
    [deck[0]!],
    [deck[1]!],
    [deck[2]!],
    [deck[3]!],
  ];

  return {
    columns,
    stock: deck.slice(4),
    discarded: [],
    score: 0,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: AcesUpState, action: AcesUpAction): AcesUpState {
  if (state.won) return state;

  switch (action.type) {
    case "deal": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const newColumns = state.columns.map((col) => [...col]);
      for (let i = 0; i < 4; i++) {
        if (newStock.length === 0) break;
        newColumns[i]!.push(newStock.shift()!);
      }
      return {
        ...state,
        columns: newColumns,
        stock: newStock,
        movesMade: state.movesMade + 1,
      };
    }

    case "discard-lowers": {
      const discardable = findDiscardable(state.columns);
      if (discardable.length === 0) return state;
      const newColumns = state.columns.map((col) => [...col]);
      const newDiscarded = [...state.discarded];
      for (const col of discardable) {
        const removed = newColumns[col]!.pop()!;
        newDiscarded.push(removed);
      }
      // Win condition: all 48 non-aces removed (4 aces remain, one per column)
      const totalInColumns = newColumns.reduce((s, c) => s + c.length, 0);
      const won = state.stock.length === 0 && totalInColumns === 4 &&
        newColumns.every((col) => col.length === 1 && col[0]!.rank === 1);
      return {
        ...state,
        columns: newColumns,
        discarded: newDiscarded,
        score: newDiscarded.length,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "move-to-empty": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      if (state.columns[fromCol]!.length === 0) return state;
      if (state.columns[toCol]!.length !== 0) return state; // target must be empty
      const newColumns = state.columns.map((col) => [...col]);
      const card = newColumns[fromCol]!.pop()!;
      newColumns[toCol]!.push(card);
      return {
        ...state,
        columns: newColumns,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AcesUpState): { score: number } | null {
  if (state.won) return { score: state.score };
  // Also check stuck: no stock, no discardable, no empty column with a move available
  if (state.stock.length > 0) return null;
  const discardable = findDiscardable(state.columns);
  if (discardable.length > 0) return null;
  // Check if any card can move to empty column (so player can create discard opportunities)
  const hasEmpty = state.columns.some((col) => col.length === 0);
  const hasMoveable = state.columns.some((col) => col.length > 0);
  if (hasEmpty && hasMoveable) return null;
  // Stuck or won
  return { score: state.score };
}
