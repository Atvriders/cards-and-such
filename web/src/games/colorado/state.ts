import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ColoradoSettings {
  _dummy?: undefined;
}

/** Colorado: Two-deck solitaire.
 *  Deal into 2 rows of 10 columns (20 piles total, 2 cards each = 40 cards), remaining 64 to stock.
 *  8 foundations (A→K by suit). Top of any pile is playable to foundations.
 *  Deal a new row of 20 cards (one per pile) when stuck.
 *  You get 5 deals total. */
export interface ColoradoState {
  piles: Card[][];   // 20 piles
  foundations: { suit: string; cards: Card[] }[];
  stock: Card[];
  dealsLeft: number;
  score: number;
  movesMade: number;
  won: boolean;
}

export type ColoradoAction =
  | { type: "move-to-foundation"; pileIdx: number; foundIdx: number }
  | { type: "deal-row" };

function foundationNext(cards: Card[]): number {
  if (cards.length === 0) return 1;
  return cards[cards.length - 1]!.rank + 1;
}

function makeDoubleDeck(rng: () => number): Card[] {
  const d1 = newDeck();
  const d2 = newDeck().map((c) => ({ ...c, id: c.id + "-b" }));
  return shuffle([...d1, ...d2], rng);
}

export function initialState(seed: number, _settings: ColoradoSettings): ColoradoState {
  const rng = mulberry32(seed);
  const deck = makeDoubleDeck(rng); // 104 cards

  // 20 piles of 2 = 40 cards, rest (64) to stock
  const piles: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 20; i++) {
    piles.push([deck[idx++]!, deck[idx++]!]);
  }
  const stock = deck.slice(idx);

  // 8 foundations
  const foundations: ColoradoState["foundations"] = [];
  for (const suit of SUITS) {
    foundations.push({ suit, cards: [] });
    foundations.push({ suit, cards: [] });
  }

  return {
    piles,
    foundations,
    stock,
    dealsLeft: 4, // 4 more deals after the initial
    score: 0,
    movesMade: 0,
    won: false,
  };
}

function totalOnFoundations(f: ColoradoState["foundations"]): number {
  return f.reduce((s, ff) => s + ff.cards.length, 0);
}

export function reducer(state: ColoradoState, action: ColoradoAction): ColoradoState {
  if (state.won) return state;

  switch (action.type) {
    case "move-to-foundation": {
      const { pileIdx, foundIdx } = action;
      const pile = state.piles[pileIdx];
      if (!pile || pile.length === 0) return state;
      const card = pile[pile.length - 1]!;
      const f = state.foundations[foundIdx];
      if (!f || f.suit !== card.suit) return state;
      if (card.rank !== foundationNext(f.cards)) return state;

      const newPiles = state.piles.map((p, i) => i === pileIdx ? p.slice(0, -1) : [...p]);
      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card] } : ff,
      );
      const total = totalOnFoundations(newFoundations);

      return {
        ...state,
        piles: newPiles,
        foundations: newFoundations,
        score: state.score + 5,
        movesMade: state.movesMade + 1,
        won: total === 104,
      };
    }

    case "deal-row": {
      if (state.dealsLeft <= 0 || state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const newPiles = state.piles.map((pile) => {
        if (newStock.length === 0) return [...pile];
        const card = newStock.shift()!;
        return [...pile, card];
      });
      return {
        ...state,
        piles: newPiles,
        stock: newStock,
        dealsLeft: state.dealsLeft - 1,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ColoradoState): { score: number } | null {
  if (totalOnFoundations(state.foundations) !== 104) return null;
  return { score: state.score };
}
