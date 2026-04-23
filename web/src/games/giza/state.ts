import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import type { Suit } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GizaSettings {
  _dummy?: undefined;
}

// Pyramid layout: 3 tiers of 3 pyramid sections, each 3×3 grid (9 cards)
// We store cards in rows within each pyramid section
// Accessible = card not covered by any card in row below it (within section)
// Foundation: 4 piles built up A-K same suit

export interface GizaState {
  // 3 pyramid "sub-pyramids" each with 3 rows:
  // row 0 = 1 card (apex), row 1 = 2 cards, row 2 = 3 cards
  pyramids: (Card | null)[][][];  // [pyramid][row][col]
  foundations: Card[][];           // [4 suits]
  stock: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: GizaSettings;
}

export type GizaAction =
  | { type: "remove-pair"; card1: { py: number; row: number; col: number }; card2: { py: number; row: number; col: number } }
  | { type: "remove-to-foundation"; py: number; row: number; col: number }
  | { type: "draw-stock" };

export function initialState(seed: number, settings: GizaSettings): GizaState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  let idx = 0;
  // 3 pyramids, each 3 rows: [1, 2, 3] cards
  const pyramids: (Card | null)[][][] = [];
  for (let p = 0; p < 3; p++) {
    const pyramid: (Card | null)[][] = [];
    for (let row = 0; row < 3; row++) {
      const count = row + 1;
      const rowCards: (Card | null)[] = [];
      for (let col = 0; col < count; col++) {
        rowCards.push(deck[idx++]!);
      }
      pyramid.push(rowCards);
    }
    pyramids.push(pyramid);
  }

  // Remaining 25 cards go to stock
  const stock = deck.slice(idx);

  return {
    pyramids,
    foundations: [[], [], [], []],
    stock,
    score: 0,
    movesMade: 0,
    won: false,
    settings,
  };
}

/** A card is accessible if it is not covered by a card in the row below */
export function isAccessible(pyramids: (Card | null)[][][], py: number, row: number, col: number): boolean {
  const card = pyramids[py]?.[row]?.[col];
  if (!card) return false;
  if (row === 2) return true; // bottom row always accessible
  // Check if the two cards below it still exist
  const below1 = pyramids[py]?.[row + 1]?.[col];
  const below2 = pyramids[py]?.[row + 1]?.[col + 1];
  return !below1 && !below2;
}

function suitIndex(suit: Suit): number {
  return SUITS.indexOf(suit);
}

function isOnFoundation(foundations: Card[][], card: Card): boolean {
  const idx = suitIndex(card.suit);
  const pile = foundations[idx]!;
  if (pile.length === 0) return card.rank === 1;
  return pile[pile.length - 1]!.rank + 1 === card.rank && pile[pile.length - 1]!.suit === card.suit;
}

export function reducer(state: GizaState, action: GizaAction): GizaState {
  if (state.won) return state;

  switch (action.type) {
    case "remove-pair": {
      const { card1, card2 } = action;
      if (!isAccessible(state.pyramids, card1.py, card1.row, card1.col)) return state;
      if (!isAccessible(state.pyramids, card2.py, card2.row, card2.col)) return state;
      const c1 = state.pyramids[card1.py]![card1.row]![card1.col]!;
      const c2 = state.pyramids[card2.py]![card2.row]![card2.col]!;
      if (!c1 || !c2) return state;
      if ((c1.rank + c2.rank) !== 13) return state;

      const newPyramids = state.pyramids.map((py) => py.map((row) => [...row]));
      newPyramids[card1.py]![card1.row]![card1.col] = null;
      newPyramids[card2.py]![card2.row]![card2.col] = null;

      const remaining = newPyramids.flat(2).filter((c) => c !== null).length;
      const won = remaining === 0 && state.stock.length === 0;

      return {
        ...state,
        pyramids: newPyramids,
        score: state.score + 10,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "remove-to-foundation": {
      const { py, row, col } = action;
      if (!isAccessible(state.pyramids, py, row, col)) return state;
      const card = state.pyramids[py]![row]![col]!;
      if (!card) return state;
      if (!isOnFoundation(state.foundations, card)) return state;

      const newPyramids = state.pyramids.map((p) => p.map((r) => [...r]));
      newPyramids[py]![row]![col] = null;
      const newFoundations = state.foundations.map((pile) => [...pile]);
      newFoundations[suitIndex(card.suit)]!.push(card);

      const remaining = newPyramids.flat(2).filter((c) => c !== null).length;
      const foundationTotal = newFoundations.reduce((sum, p) => sum + p.length, 0);
      const won = remaining === 0 && state.stock.length === 0 && foundationTotal === 52;

      return {
        ...state,
        pyramids: newPyramids,
        foundations: newFoundations,
        score: state.score + 15,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "draw-stock": {
      if (state.stock.length === 0) return state;
      const card = state.stock[state.stock.length - 1]!;
      const newStock = state.stock.slice(0, state.stock.length - 1);

      // Try to auto-play to foundation
      if (isOnFoundation(state.foundations, card)) {
        const newFoundations = state.foundations.map((pile) => [...pile]);
        newFoundations[suitIndex(card.suit)]!.push(card);
        const remaining = state.pyramids.flat(2).filter((c) => c !== null).length;
        const foundationTotal = newFoundations.reduce((sum, p) => sum + p.length, 0);
        const won = remaining === 0 && newStock.length === 0 && foundationTotal === 52;
        return {
          ...state,
          stock: newStock,
          foundations: newFoundations,
          score: state.score + 15,
          movesMade: state.movesMade + 1,
          won,
        };
      }

      // Otherwise discard (represented by popping from stock with no destination; score 0)
      return {
        ...state,
        stock: newStock,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GizaState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
