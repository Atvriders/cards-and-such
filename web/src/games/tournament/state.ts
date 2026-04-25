import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Tournament Solitaire
 * Two decks. 4 foundations build A→K by suit (one set of suits).
 * Other 4 foundations build K→A by suit.
 * 8 depot columns (face-up fans, top is playable).
 * Stock drawn one at a time to a single waste.
 * Tableau: 4 reserve cells (one card each, available any time).
 */

export interface TournamentState {
  /** 4 ascending foundations (A→K) */
  ascFound: Card[][];
  /** 4 descending foundations (K→A) */
  descFound: Card[][];
  /** 8 tableau columns */
  tableau: Card[][];
  /** 4 reserve cells */
  reserve: (Card | null)[];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type TournamentAction =
  | { type: "draw" }
  | { type: "move-to-asc"; source: string; foundIndex: number }
  | { type: "move-to-desc"; source: string; foundIndex: number }
  | { type: "move-to-reserve"; source: string; reserveIndex: number }
  | { type: "move-reserve-to-found"; reserveIndex: number; asc: boolean; foundIndex: number }
  | { type: "move-col-to-col"; fromCol: number; toCol: number };

function canAsc(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 1;
  const top = found[found.length - 1]!;
  return top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number);
}

function canDesc(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 13;
  const top = found[found.length - 1]!;
  return top.suit === card.suit && (top.rank as number) - 1 === (card.rank as number);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

function canTableau(target: Card, moving: Card): boolean {
  return isRed(target.suit) !== isRed(moving.suit) && (target.rank as number) === (moving.rank as number) + 1;
}

function getSourceCard(state: TournamentState, source: string): { card: Card; newState: TournamentState } | null {
  if (source === "waste") {
    if (state.waste.length === 0) return null;
    const card = state.waste[state.waste.length - 1]!;
    return { card, newState: { ...state, waste: state.waste.slice(0, -1) } };
  }
  if (source.startsWith("t")) {
    const ci = parseInt(source.slice(1), 10);
    const col = state.tableau[ci];
    if (!col || col.length === 0) return null;
    const card = col[col.length - 1]!;
    const newTableau = state.tableau.map((c, i) => i === ci ? c.slice(0, -1) : [...c]);
    return { card, newState: { ...state, tableau: newTableau } };
  }
  return null;
}

export function initialState(seed: number): TournamentState {
  const rng = mulberry32(seed);
  const deck = shuffle([...newDeck(), ...newDeck()], rng);

  // Deal 8 columns of 12 cards = 96 cards
  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    tableau.push(deck.slice(idx, idx + 12));
    idx += 12;
  }
  const stock = deck.slice(idx); // 8 remaining cards

  return {
    ascFound: [[], [], [], []],
    descFound: [[], [], [], []],
    tableau,
    reserve: [null, null, null, null],
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: TournamentState, action: TournamentAction): TournamentState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.shift()!;
      return { ...state, stock: newStock, waste: [...state.waste, card], movesMade: state.movesMade + 1 };
    }

    case "move-to-asc": {
      const src = getSourceCard(state, action.source);
      if (!src) return state;
      const found = src.newState.ascFound[action.foundIndex];
      if (!found || !canAsc(found, src.card)) return state;
      const newAsc = src.newState.ascFound.map((f, i) => i === action.foundIndex ? [...f, src.card] : [...f]);
      const won = newAsc.every((f) => f.length === 13) && src.newState.descFound.every((f) => f.length === 13);
      return { ...src.newState, ascFound: newAsc, score: src.newState.score + 5, movesMade: src.newState.movesMade + 1, won };
    }

    case "move-to-desc": {
      const src = getSourceCard(state, action.source);
      if (!src) return state;
      const found = src.newState.descFound[action.foundIndex];
      if (!found || !canDesc(found, src.card)) return state;
      const newDesc = src.newState.descFound.map((f, i) => i === action.foundIndex ? [...f, src.card] : [...f]);
      const won = state.ascFound.every((f) => f.length === 13) && newDesc.every((f) => f.length === 13);
      return { ...src.newState, descFound: newDesc, score: src.newState.score + 5, movesMade: src.newState.movesMade + 1, won };
    }

    case "move-to-reserve": {
      const { source, reserveIndex } = action;
      if (state.reserve[reserveIndex] !== null) return state;
      const src = getSourceCard(state, source);
      if (!src) return state;
      const newReserve = [...state.reserve];
      newReserve[reserveIndex] = src.card;
      return { ...src.newState, reserve: newReserve, movesMade: src.newState.movesMade + 1 };
    }

    case "move-reserve-to-found": {
      const { reserveIndex, asc, foundIndex } = action;
      const card = state.reserve[reserveIndex];
      if (!card) return state;
      if (asc) {
        const found = state.ascFound[foundIndex];
        if (!found || !canAsc(found, card)) return state;
        const newAsc = state.ascFound.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
        const newReserve = [...state.reserve];
        newReserve[reserveIndex] = null;
        const won = newAsc.every((f) => f.length === 13) && state.descFound.every((f) => f.length === 13);
        return { ...state, ascFound: newAsc, reserve: newReserve, score: state.score + 5, movesMade: state.movesMade + 1, won };
      } else {
        const found = state.descFound[foundIndex];
        if (!found || !canDesc(found, card)) return state;
        const newDesc = state.descFound.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
        const newReserve = [...state.reserve];
        newReserve[reserveIndex] = null;
        const won = state.ascFound.every((f) => f.length === 13) && newDesc.every((f) => f.length === 13);
        return { ...state, descFound: newDesc, reserve: newReserve, score: state.score + 5, movesMade: state.movesMade + 1, won };
      }
    }

    case "move-col-to-col": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || from.length === 0 || !to || to.length === 0) return state;
      const card = from[from.length - 1]!;
      if (!canTableau(to[to.length - 1]!, card)) return state;
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

export function isTerminal(state: TournamentState): { score: number } | null {
  if (state.won) return { score: state.score };
  return null; // simplified — game always eventually ends
}
