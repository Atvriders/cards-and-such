import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GolfSettings {
  wrapAces: boolean;
}

export interface GolfState {
  /** 7 tableau columns, each an array of cards (all face-up). */
  tableau: Card[][];
  /** Stock pile (face-down); top is last element. */
  stock: Card[];
  /** Waste pile; top is last element. The waste top is the current "foundation". */
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: GolfSettings;
}

export type GolfAction =
  | { type: "draw" }
  | { type: "move-to-waste"; colIndex: number };

function rankVal(card: Card): number {
  return card.rank as number;
}

function canPlayOnWaste(top: Card, candidate: Card, wrapAces: boolean): boolean {
  const tv = rankVal(top);
  const cv = rankVal(candidate);
  if (wrapAces) {
    // Aces also wrap (1 connects to both 2 and K)
    const diff = Math.abs(tv - cv);
    return diff === 1 || diff === 12;
  }
  // No wrap: Kings are high (13), Aces are low (1). Just ±1, no wrap.
  return Math.abs(tv - cv) === 1;
}

export function initialState(seed: number, settings: GolfSettings): GolfState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // 7 columns of 5 cards
  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    tableau.push(deck.slice(idx, idx + 5));
    idx += 5;
  }

  // Remaining 17 cards: 16 in stock + 1 flipped to waste
  const remaining = deck.slice(idx);
  const firstWaste = remaining.pop()!;

  return {
    tableau,
    stock: remaining,
    waste: [firstWaste],
    score: 0,
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: GolfState, action: GolfAction): GolfState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      const newWaste = [...state.waste, card];
      return { ...state, stock: newStock, waste: newWaste, movesMade: state.movesMade + 1 };
    }

    case "move-to-waste": {
      const { colIndex } = action;
      const col = state.tableau[colIndex];
      if (!col || col.length === 0) return state;
      const wasteTop = state.waste[state.waste.length - 1]!;
      const card = col[col.length - 1]!;
      if (!canPlayOnWaste(wasteTop, card, state.settings.wrapAces)) return state;

      const newTableau = state.tableau.map((c, i) => i === colIndex ? c.slice(0, -1) : [...c]);
      const newWaste = [...state.waste, card];
      const totalRemaining = newTableau.reduce((s, c) => s + c.length, 0);
      const won = totalRemaining === 0 && state.stock.length === 0;
      const score = state.score + 1;

      return {
        ...state,
        tableau: newTableau,
        waste: newWaste,
        score,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GolfState): { score: number } | null {
  const tableauEmpty = state.tableau.every((col) => col.length === 0);
  if (!tableauEmpty) return null;
  if (state.stock.length > 0) return null;
  return { score: state.score };
}
