import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AustralianPatienceState {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  movesMade: number;
  won: boolean;
}

export type AustralianPatienceAction =
  | { type: "move"; fromCol: number; toCol: number; cardIdx: number }
  | { type: "move-to-foundation"; fromCol: number }
  | { type: "draw" };

export function initialState(seed: number): AustralianPatienceState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal 7 columns: first 4 get 6 cards (face-up), last 3 get 5 cards
  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    const count = i < 4 ? 6 : 5;
    tableau.push(deck.slice(idx, idx + count));
    idx += count;
  }

  const stock = deck.slice(idx); // remaining 9 cards

  return {
    tableau,
    foundations: [[], [], [], []],
    stock,
    movesMade: 0,
    won: false,
  };
}

function canPlaceOnTableau(target: Card[], card: Card): boolean {
  if (target.length === 0) return true;
  const top = target[target.length - 1]!;
  // Build down regardless of suit
  return card.rank === top.rank - 1;
}

function canPlaceOnFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1]!;
  return card.suit === top.suit && card.rank === top.rank + 1;
}

function findFoundation(foundations: Card[][], card: Card): number {
  for (let i = 0; i < foundations.length; i++) {
    if (canPlaceOnFoundation(foundations[i]!, card)) return i;
  }
  return -1;
}

export function reducer(state: AustralianPatienceState, action: AustralianPatienceAction): AustralianPatienceState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromCol, toCol, cardIdx } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || !to) return state;
      if (cardIdx >= from.length) return state;
      const moving = from.slice(cardIdx);
      const target = to;
      if (moving.length === 0) return state;
      const topMoving = moving[0]!;
      if (!canPlaceOnTableau(target, topMoving)) return state;

      const newTableau = state.tableau.map((col, i) => {
        if (i === fromCol) return col.slice(0, cardIdx);
        if (i === toCol) return [...col, ...moving];
        return col;
      });

      return { ...state, tableau: newTableau, movesMade: state.movesMade + 1 };
    }

    case "move-to-foundation": {
      const { fromCol } = action;
      const col = state.tableau[fromCol];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;
      const fIdx = findFoundation(state.foundations, card);
      if (fIdx === -1) return state;

      const newTableau = state.tableau.map((c, i) => i === fromCol ? c.slice(0, -1) : c);
      const newFoundations = state.foundations.map((f, i) => i === fIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);

      return {
        ...state,
        tableau: newTableau,
        foundations: newFoundations,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "draw": {
      if (state.stock.length === 0) return state;
      // Deal one card face-up to each tableau column
      let remaining = [...state.stock];
      const newTableau = state.tableau.map((col) => {
        if (remaining.length === 0) return col;
        const card = remaining.shift()!;
        return [...col, card];
      });
      return { ...state, tableau: newTableau, stock: remaining, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AustralianPatienceState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
