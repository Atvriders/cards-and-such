import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ArchwayState {
  /** 8 foundation piles (first 4 build A→K per suit, last 4 build K→A per suit) */
  foundations: Card[][];
  /** 12 tableau fans, each holding 4 cards dealt face-up */
  fans: Card[][];
  /** Remaining stock after the deal */
  stock: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type ArchwayAction =
  | { type: "draw" }
  | { type: "move-fan"; fanIndex: number; toPile: string }
  | { type: "move-stock-to-foundation"; foundationIndex: number };

const SUITS = ["♠", "♥", "♦", "♣"] as const;

function suitIndex(suit: string): number {
  return SUITS.indexOf(suit as (typeof SUITS)[number]);
}

function canPlaceOnFoundation(found: Card[], card: Card, ascending: boolean): boolean {
  const si = suitIndex(card.suit);
  if (ascending) {
    // Foundation index 0-3: build A→K by suit
    if (found.length === 0) return card.rank === 1;
    const top = found[found.length - 1]!;
    return top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number);
  } else {
    // Foundation index 4-7: build K→A by suit
    if (found.length === 0) return card.rank === 13;
    const top = found[found.length - 1]!;
    return top.suit === card.suit && (top.rank as number) - 1 === (card.rank as number);
  }
}

export function initialState(seed: number): ArchwayState {
  const rng = mulberry32(seed);
  // Use 2 decks
  const deck = shuffle([...newDeck(), ...newDeck()], rng);

  // 12 fans of 4 cards = 48 cards, remaining 56 go to stock
  const fans: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 12; i++) {
    fans.push(deck.slice(idx, idx + 4));
    idx += 4;
  }
  const stock = deck.slice(idx);

  const foundations: Card[][] = Array.from({ length: 8 }, () => []);

  return { foundations, fans, stock, score: 0, movesMade: 0, won: false };
}

export function reducer(state: ArchwayState, action: ArchwayAction): ArchwayState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.shift()!;
      // Try to auto-place on any foundation; otherwise add a 13th+ fan
      for (let fi = 0; fi < 8; fi++) {
        const ascending = fi < 4;
        if (canPlaceOnFoundation(state.foundations[fi]!, card, ascending)) {
          const newFoundations = state.foundations.map((f, i) =>
            i === fi ? [...f, card] : [...f],
          );
          const newScore = state.score + 1;
          const won = newFoundations.every((f) => f.length === 13);
          return { ...state, foundations: newFoundations, stock: newStock, score: newScore, movesMade: state.movesMade + 1, won };
        }
      }
      // Add to a new fan slot or extend
      const newFans = [...state.fans.map((f) => [...f])];
      newFans.push([card]);
      return { ...state, fans: newFans, stock: newStock, movesMade: state.movesMade + 1 };
    }

    case "move-fan": {
      const { fanIndex, toPile } = action;
      if (fanIndex < 0 || fanIndex >= state.fans.length) return state;
      const fan = state.fans[fanIndex]!;
      if (fan.length === 0) return state;
      const card = fan[fan.length - 1]!;

      const fi = parseInt(toPile.replace("f", ""), 10);
      if (isNaN(fi) || fi < 0 || fi >= 8) return state;
      const ascending = fi < 4;
      if (!canPlaceOnFoundation(state.foundations[fi]!, card, ascending)) return state;

      const newFoundations = state.foundations.map((f, i) =>
        i === fi ? [...f, card] : [...f],
      );
      const newFans = state.fans.map((f, i) =>
        i === fanIndex ? f.slice(0, -1) : [...f],
      );
      const newScore = state.score + 1;
      const won = newFoundations.every((f) => f.length === 13);
      return { ...state, foundations: newFoundations, fans: newFans, score: newScore, movesMade: state.movesMade + 1, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ArchwayState): { score: number } | null {
  if (state.won) return { score: state.score };
  // Also terminal if stock empty and no legal moves
  if (state.stock.length > 0) return null;
  for (const fan of state.fans) {
    if (fan.length === 0) continue;
    const card = fan[fan.length - 1]!;
    for (let fi = 0; fi < 8; fi++) {
      if (canPlaceOnFoundation(state.foundations[fi]!, card, fi < 4)) return null;
    }
  }
  return { score: state.score };
}
