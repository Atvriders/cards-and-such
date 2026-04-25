import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface JubileeSettings {
  _dummy?: undefined;
}

/** Jubilee (a.k.a. "Fives"): two decks. Build 8 foundations up by 5s (circular).
 *  Tableau: 10 columns. Top cards of tableau or waste are playable.
 *  Win: all 104 cards on foundations. */
export interface JubileeState {
  foundations: { suit: string; baseRank: number; cards: Card[] }[];
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type JubileeAction =
  | { type: "draw" }
  | { type: "move-to-foundation"; fromType: "tableau" | "waste"; fromIdx: number; foundIdx: number }
  | { type: "move-tableau"; fromCol: number; toCol: number };

function rankPlusN(rank: number, n: number): number {
  return ((rank - 1 + n) % 13) + 1;
}

/** Jubilee foundation: each pile builds upward by 5 (wrapping), all same suit */
function foundationNext(f: { suit: string; baseRank: number; cards: Card[] }): number {
  if (f.cards.length === 0) return f.baseRank;
  const top = f.cards[f.cards.length - 1]!;
  return rankPlusN(top.rank, 5);
}

function canPlaceOnFoundation(
  f: JubileeState["foundations"][number],
  card: Card,
): boolean {
  if (card.suit !== f.suit) return false;
  return card.rank === foundationNext(f);
}

function makeDoubleDeck(rng: () => number): Card[] {
  const d1 = newDeck();
  const d2 = newDeck().map((c) => ({ ...c, id: c.id + "-b" }));
  return shuffle([...d1, ...d2], rng);
}

export function initialState(seed: number, _settings: JubileeSettings): JubileeState {
  const rng = mulberry32(seed);
  const deck = makeDoubleDeck(rng);

  // Determine base ranks: first card of each suit determines the base
  const foundBases: Record<string, number> = {};
  for (const card of deck) {
    if (!foundBases[card.suit]) {
      foundBases[card.suit] = card.rank;
    }
    if (Object.keys(foundBases).length === 4) break;
  }

  // 8 foundations (2 per suit), base rank = first occurrence of that suit
  const foundations: JubileeState["foundations"] = [];
  for (const suit of SUITS) {
    const base = foundBases[suit] ?? 1;
    foundations.push({ suit, baseRank: base, cards: [] });
    foundations.push({ suit, baseRank: base, cards: [] });
  }

  // Deal 10 columns of 5 cards each (50 cards), rest to stock
  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    tableau.push(deck.slice(idx, idx + 5));
    idx += 5;
  }
  const stock = deck.slice(idx);

  return {
    foundations,
    tableau,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
  };
}

function totalOnFoundations(foundations: JubileeState["foundations"]): number {
  return foundations.reduce((s, f) => s + f.cards.length, 0);
}

export function reducer(state: JubileeState, action: JubileeAction): JubileeState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      const newWaste = [...state.waste, card];
      return { ...state, stock: newStock, waste: newWaste, movesMade: state.movesMade + 1 };
    }

    case "move-to-foundation": {
      const { fromType, fromIdx, foundIdx } = action;
      let card: Card | undefined;
      let newTableau = state.tableau.map((c) => [...c]);
      let newWaste = [...state.waste];

      if (fromType === "waste") {
        if (state.waste.length === 0) return state;
        card = state.waste[state.waste.length - 1]!;
        newWaste = state.waste.slice(0, -1);
      } else {
        const col = newTableau[fromIdx];
        if (!col || col.length === 0) return state;
        card = col[col.length - 1]!;
        newTableau[fromIdx] = col.slice(0, -1);
      }

      const f = state.foundations[foundIdx];
      if (!f || !canPlaceOnFoundation(f, card)) return state;

      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card!] } : ff,
      );
      const total = totalOnFoundations(newFoundations);
      const won = total === 104;

      return {
        ...state,
        foundations: newFoundations,
        tableau: newTableau,
        waste: newWaste,
        score: state.score + 5,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "move-tableau": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || from.length === 0) return state;
      if (!to) return state;
      const card = from[from.length - 1]!;
      // Can always place on tableau (no restrictions in Jubilee)
      const newTableau = state.tableau.map((col, i) => {
        if (i === fromCol) return col.slice(0, -1);
        if (i === toCol) return [...col, card];
        return [...col];
      });
      return {
        ...state,
        tableau: newTableau,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: JubileeState): { score: number } | null {
  const total = totalOnFoundations(state.foundations);
  if (total !== 104) return null;
  return { score: state.score };
}
