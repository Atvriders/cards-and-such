import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Seven Up Solitaire
 * Single deck. Foundations start at rank 7 (not Ace).
 * 4 foundations: build from 7 upward (7,8,9,10,J,Q,K) then wrap A,2,3,4,5,6.
 * Tableau: 7 columns (like Klondike but foundations start at 7).
 * Stock drawn one at a time.
 */

export interface SevenUpState {
  foundations: Card[][];
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type SevenUpAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move-to-foundation"; fromPile: string; foundIndex: number }
  | { type: "move-tableau"; fromCol: number; toCol: number };

const SEVEN_UP_ORDER: number[] = [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6];

function nextRank(current: number): number {
  const idx = SEVEN_UP_ORDER.indexOf(current);
  return SEVEN_UP_ORDER[(idx + 1) % 13]!;
}

function canFoundation(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 7;
  if (found.length === 13) return false;
  const top = found[found.length - 1]!;
  return top.suit === card.suit && nextRank(top.rank as number) === (card.rank as number);
}

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

function canTableau(target: Card, moving: Card): boolean {
  return isRed(target.suit) !== isRed(moving.suit) && (target.rank as number) === (moving.rank as number) + 1;
}

export function initialState(seed: number): SevenUpState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal 7 columns (Klondike-style: i+1 cards, bottom face-down, top face-up)
  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    tableau.push(deck.slice(idx, idx + i + 1));
    idx += i + 1;
  }
  const stock = deck.slice(idx);

  return {
    foundations: [[], [], [], []],
    tableau,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: SevenUpState, action: SevenUpAction): SevenUpState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return { ...state, stock: newStock, waste: [...state.waste, card], movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      if (state.stock.length > 0 || state.waste.length === 0) return state;
      return { ...state, stock: [...state.waste].reverse(), waste: [], movesMade: state.movesMade + 1 };
    }

    case "move-to-foundation": {
      const { fromPile, foundIndex } = action;
      const found = state.foundations[foundIndex];
      if (!found) return state;

      let card: Card | undefined;
      let newTableau = state.tableau;
      let newWaste = state.waste;

      if (fromPile === "waste") {
        if (state.waste.length === 0) return state;
        card = state.waste[state.waste.length - 1]!;
        newWaste = state.waste.slice(0, -1);
      } else {
        const ci = parseInt(fromPile.replace("t", ""), 10);
        if (isNaN(ci) || ci < 0 || ci >= state.tableau.length) return state;
        const col = state.tableau[ci]!;
        if (col.length === 0) return state;
        card = col[col.length - 1]!;
        newTableau = state.tableau.map((c, i) => i === ci ? c.slice(0, -1) : [...c]);
      }

      if (!canFoundation(found, card)) return state;
      const newFound = state.foundations.map((f, i) => i === foundIndex ? [...f, card!] : [...f]);
      const won = newFound.every((f) => f.length === 13);
      return { ...state, tableau: newTableau, waste: newWaste, foundations: newFound, score: state.score + 10, movesMade: state.movesMade + 1, won };
    }

    case "move-tableau": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || from.length === 0 || !to) return state;
      const card = from[from.length - 1]!;
      if (to.length === 0) {
        // Only Kings go in empty columns (or any if no restrictions)
        // Seven Up follows Klondike: empty accepts any card
      } else {
        if (!canTableau(to[to.length - 1]!, card)) return state;
      }
      const newCols = state.tableau.map((c, i) => {
        if (i === fromCol) return c.slice(0, -1);
        if (i === toCol) return [...c, card];
        return [...c];
      });
      return { ...state, tableau: newCols, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SevenUpState): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.stock.length > 0 || state.waste.length > 0) return null;
  // Check tableau for moves
  for (let ci = 0; ci < state.tableau.length; ci++) {
    const col = state.tableau[ci]!;
    if (col.length === 0) continue;
    const card = col[col.length - 1]!;
    for (let fi = 0; fi < 4; fi++) {
      if (canFoundation(state.foundations[fi]!, card)) return null;
    }
    for (let ti = 0; ti < state.tableau.length; ti++) {
      if (ti === ci) continue;
      const to = state.tableau[ti]!;
      if (to.length === 0 || canTableau(to[to.length - 1]!, card)) return null;
    }
  }
  return { score: state.score };
}
