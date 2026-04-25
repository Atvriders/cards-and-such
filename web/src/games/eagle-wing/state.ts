import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EagleWingSettings {
  _dummy?: undefined;
}

/** Eagle Wing: 13 tableau piles (the "wing"), 4 foundations, 1 reserve (13 cards), 1 stock.
 *  All 52 cards. Reserve is dealt 13 face-up. Tableau piles start 1 card each.
 *  Build foundations up by suit, A→K. Tableau builds down (any suit).
 *  Top of reserve or tableau is playable. Only 1 card at a time moves. */
export interface EagleWingState {
  tableau: Card[][];       // 13 columns, 1 card each initially
  reserve: Card[];         // 13 face-up cards
  foundations: { suit: string; cards: Card[] }[];
  stock: Card[];
  waste: Card[];
  recyclesLeft: number;
  score: number;
  movesMade: number;
  won: boolean;
}

export type EagleWingAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move-to-foundation"; fromType: "tableau" | "reserve" | "waste"; fromIdx: number; foundIdx: number }
  | { type: "move-to-tableau"; fromType: "reserve" | "waste"; fromIdx: number; toCol: number }
  | { type: "move-tableau-to-tableau"; fromCol: number; toCol: number };

function foundationNext(cards: Card[]): number {
  if (cards.length === 0) return 1;
  return cards[cards.length - 1]!.rank + 1;
}

export function initialState(seed: number, _settings: EagleWingSettings): EagleWingState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  let idx = 0;
  // 13 tableau piles of 1 card each = 13 cards
  const tableau: Card[][] = [];
  for (let i = 0; i < 13; i++) {
    tableau.push([deck[idx++]!]);
  }

  // 13 reserve cards
  const reserve: Card[] = [];
  for (let i = 0; i < 13; i++) {
    reserve.push(deck[idx++]!);
  }

  // 4 foundations
  const foundations = SUITS.map((suit) => ({ suit, cards: [] as Card[] }));

  // Rest to stock
  const stock = deck.slice(idx);

  return {
    tableau,
    reserve,
    foundations,
    stock,
    waste: [],
    recyclesLeft: 3,
    score: 0,
    movesMade: 0,
    won: false,
  };
}

function totalOnFoundations(f: EagleWingState["foundations"]): number {
  return f.reduce((s, ff) => s + ff.cards.length, 0);
}

export function reducer(state: EagleWingState, action: EagleWingAction): EagleWingState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return { ...state, stock: newStock, waste: [...state.waste, card], movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      if (state.stock.length > 0 || state.recyclesLeft <= 0 || state.waste.length === 0) return state;
      return {
        ...state,
        stock: [...state.waste].reverse(),
        waste: [],
        recyclesLeft: state.recyclesLeft - 1,
        movesMade: state.movesMade + 1,
      };
    }

    case "move-to-foundation": {
      const { fromType, fromIdx, foundIdx } = action;
      let card: Card | undefined;
      let newTableau = state.tableau.map((c) => [...c]);
      let newReserve = [...state.reserve];
      let newWaste = [...state.waste];

      if (fromType === "tableau") {
        const col = newTableau[fromIdx];
        if (!col || col.length === 0) return state;
        card = col[col.length - 1]!;
        newTableau[fromIdx] = col.slice(0, -1);
      } else if (fromType === "reserve") {
        if (state.reserve.length === 0) return state;
        card = newReserve[newReserve.length - 1]!;
        newReserve = newReserve.slice(0, -1);
      } else {
        if (state.waste.length === 0) return state;
        card = newWaste[newWaste.length - 1]!;
        newWaste = newWaste.slice(0, -1);
      }

      const f = state.foundations[foundIdx];
      if (!f || f.suit !== card.suit || card.rank !== foundationNext(f.cards)) return state;

      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card!] } : ff,
      );
      const total = totalOnFoundations(newFoundations);

      return {
        ...state,
        tableau: newTableau,
        reserve: newReserve,
        waste: newWaste,
        foundations: newFoundations,
        score: state.score + 10,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "move-to-tableau": {
      const { fromType, fromIdx, toCol } = action;
      let card: Card | undefined;
      let newReserve = [...state.reserve];
      let newWaste = [...state.waste];

      if (fromType === "reserve") {
        if (state.reserve.length === 0) return state;
        card = newReserve[newReserve.length - 1]!;
        newReserve = newReserve.slice(0, -1);
      } else {
        if (state.waste.length === 0) return state;
        card = newWaste[newWaste.length - 1]!;
        newWaste = newWaste.slice(0, -1);
      }

      const col = state.tableau[toCol];
      if (!col) return state;
      // Build down any suit
      if (col.length > 0) {
        const colTop = col[col.length - 1]!;
        if (card.rank !== colTop.rank - 1) return state;
      }

      const newTableau = state.tableau.map((c, i) =>
        i === toCol ? [...c, card!] : [...c],
      );
      return {
        ...state,
        tableau: newTableau,
        reserve: newReserve,
        waste: newWaste,
        movesMade: state.movesMade + 1,
      };
    }

    case "move-tableau-to-tableau": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || from.length === 0) return state;
      if (!to) return state;
      const card = from[from.length - 1]!;
      if (to.length > 0) {
        const toTop = to[to.length - 1]!;
        if (card.rank !== toTop.rank - 1) return state;
      }
      const newTableau = state.tableau.map((col, i) => {
        if (i === fromCol) return col.slice(0, -1);
        if (i === toCol) return [...col, card];
        return [...col];
      });
      return { ...state, tableau: newTableau, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: EagleWingState): { score: number } | null {
  if (totalOnFoundations(state.foundations) !== 52) return null;
  return { score: state.score };
}
