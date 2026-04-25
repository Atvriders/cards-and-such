import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Salic Law Solitaire
 * Two decks. Kings are separated out as the base of 8 tableau columns.
 * The remaining 96 cards (no Kings) are dealt face-up to those columns.
 * 4 Aces are placed as foundation starters.
 * Build foundations A→Q by suit (no Kings needed — hence "Salic Law": Kings don't count).
 * On the tableau, build down in any suit (rank only, any suit).
 * Stock: leftover cards drawn one at a time.
 */

export interface SalicLawState {
  foundations: Card[][];   // 4 piles, A→Q (12 cards each)
  columns: Card[][];       // 8 columns, each headed by a King
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type SalicLawAction =
  | { type: "draw" }
  | { type: "move-waste-to-foundation"; foundIndex: number }
  | { type: "move-waste-to-col"; colIndex: number }
  | { type: "move-col-to-foundation"; colIndex: number; foundIndex: number }
  | { type: "move-col-to-col"; fromCol: number; toCol: number };

function canFoundation(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 1; // Ace starts
  if (found.length === 12) return false; // Q is max (rank 12)
  const top = found[found.length - 1]!;
  return top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number);
}

function canTableau(target: Card, moving: Card): boolean {
  if (target.rank === 13) return true; // any card on King
  return (target.rank as number) === (moving.rank as number) + 1;
}

export function initialState(seed: number): SalicLawState {
  const rng = mulberry32(seed);
  const raw = [...newDeck(), ...newDeck()];
  const shuffled = shuffle(raw, rng);

  // Extract Kings for column bases
  const kings: Card[] = [];
  const nonKings: Card[] = [];
  for (const c of shuffled) {
    if (c.rank === 13 && kings.length < 8) kings.push(c);
    else nonKings.push(c);
  }
  // If somehow fewer than 8 kings (shouldn't happen with 2 decks), pad
  while (kings.length < 8) {
    const idx = nonKings.findIndex((c) => c.rank === 13);
    if (idx >= 0) kings.push(...nonKings.splice(idx, 1));
    else break;
  }

  // Extract 4 aces for foundations
  const aces: Card[] = [];
  const rest: Card[] = [];
  for (const c of nonKings) {
    if (c.rank === 1 && aces.length < 4) aces.push(c);
    else rest.push(c);
  }

  const foundations: Card[][] = aces.map((a) => [a]);
  while (foundations.length < 4) foundations.push([]);

  // Deal remaining to 8 columns (11 cards each = 88 cards), stock = rest
  const columns: Card[][] = kings.map((k) => [k]);
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    columns[i]!.push(...rest.slice(idx, idx + 11));
    idx += 11;
  }
  const stock = rest.slice(idx);

  return { foundations, columns, stock, waste: [], score: aces.length, movesMade: 0, won: false };
}

export function reducer(state: SalicLawState, action: SalicLawAction): SalicLawState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.shift()!;
      const newWaste = [...state.waste, card];
      return { ...state, stock: newStock, waste: newWaste, movesMade: state.movesMade + 1 };
    }

    case "move-waste-to-foundation": {
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const found = state.foundations[action.foundIndex];
      if (!found || !canFoundation(found, card)) return state;
      const newWaste = state.waste.slice(0, -1);
      const newFound = state.foundations.map((f, i) => i === action.foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 12);
      return { ...state, waste: newWaste, foundations: newFound, score: state.score + 5, movesMade: state.movesMade + 1, won };
    }

    case "move-waste-to-col": {
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const col = state.columns[action.colIndex];
      if (!col) return state;
      const top = col[col.length - 1]!;
      if (!canTableau(top, card)) return state;
      const newWaste = state.waste.slice(0, -1);
      const newCols = state.columns.map((c, i) => i === action.colIndex ? [...c, card] : [...c]);
      return { ...state, waste: newWaste, columns: newCols, movesMade: state.movesMade + 1 };
    }

    case "move-col-to-foundation": {
      const col = state.columns[action.colIndex];
      const found = state.foundations[action.foundIndex];
      if (!col || col.length === 0 || !found) return state;
      const card = col[col.length - 1]!;
      if (card.rank === 13) return state; // Kings don't go to foundation (Salic Law)
      if (!canFoundation(found, card)) return state;
      const newCols = state.columns.map((c, i) => i === action.colIndex ? c.slice(0, -1) : [...c]);
      const newFound = state.foundations.map((f, i) => i === action.foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 12);
      return { ...state, columns: newCols, foundations: newFound, score: state.score + 5, movesMade: state.movesMade + 1, won };
    }

    case "move-col-to-col": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.columns[fromCol];
      const to = state.columns[toCol];
      if (!from || from.length === 0 || !to || to.length === 0) return state;
      const card = from[from.length - 1]!;
      if (card.rank === 13) return state; // can't move King base
      const top = to[to.length - 1]!;
      if (!canTableau(top, card)) return state;
      const newCols = state.columns.map((c, i) => {
        if (i === fromCol) return c.slice(0, -1);
        if (i === toCol) return [...c, card];
        return [...c];
      });
      return { ...state, columns: newCols, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SalicLawState): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.stock.length > 0) return null;
  // Check waste-to-foundation or waste-to-col
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1]!;
    for (let fi = 0; fi < 4; fi++) {
      if (canFoundation(state.foundations[fi]!, card)) return null;
    }
    for (const col of state.columns) {
      if (col.length > 0 && canTableau(col[col.length - 1]!, card)) return null;
    }
  }
  // Check col-to-foundation or col-to-col
  for (let ci = 0; ci < state.columns.length; ci++) {
    const col = state.columns[ci]!;
    if (col.length === 0) continue;
    const card = col[col.length - 1]!;
    if (card.rank === 13) continue;
    for (let fi = 0; fi < 4; fi++) {
      if (canFoundation(state.foundations[fi]!, card)) return null;
    }
    for (let ti = 0; ti < state.columns.length; ti++) {
      if (ti === ci) continue;
      const to = state.columns[ti]!;
      if (to.length > 0 && canTableau(to[to.length - 1]!, card)) return null;
    }
  }
  return { score: state.score };
}
