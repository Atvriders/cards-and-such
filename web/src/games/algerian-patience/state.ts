import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AlgerianPatienceSettings {
  _dummy?: undefined;
}

/** Algerian Patience: two decks, 8 foundations (4 build A→K up, 4 build K→A down, by suit).
 *  8 tableau columns, can build up or down in same suit.
 *  Stock deals one at a time to waste; unlimited recycles.
 *  Only top card of tableau/waste is playable (single-card moves). */
export interface AlgerianPatienceState {
  tableau: Card[][];
  foundations: { suit: string; direction: "up" | "down"; cards: Card[] }[];
  stock: Card[];
  waste: Card[];
  recyclesLeft: number;
  score: number;
  movesMade: number;
  won: boolean;
}

export type AlgerianPatienceAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move-to-foundation"; fromType: "tableau" | "waste"; fromIdx: number; foundIdx: number }
  | { type: "move-tableau"; fromCol: number; toCol: number }
  | { type: "move-waste-to-tableau"; toCol: number };

function foundationNext(f: AlgerianPatienceState["foundations"][number]): number | null {
  if (f.direction === "up") {
    if (f.cards.length === 0) return 1; // Ace
    const top = f.cards[f.cards.length - 1]!;
    if (top.rank === 13) return null; // full
    return top.rank + 1;
  } else {
    if (f.cards.length === 0) return 13; // King
    const top = f.cards[f.cards.length - 1]!;
    if (top.rank === 1) return null; // full
    return top.rank - 1;
  }
}

function canTableauStack(top: Card, moving: Card): boolean {
  // Same suit, adjacent rank (either direction)
  if (top.suit !== moving.suit) return false;
  return moving.rank === top.rank + 1 || moving.rank === top.rank - 1;
}

function makeDoubleDeck(rng: () => number): Card[] {
  const d1 = newDeck();
  const d2 = newDeck().map((c) => ({ ...c, id: c.id + "-b" }));
  return shuffle([...d1, ...d2], rng);
}

export function initialState(seed: number, _settings: AlgerianPatienceSettings): AlgerianPatienceState {
  const rng = mulberry32(seed);
  const deck = makeDoubleDeck(rng);

  // 8 foundations: 4 up (one per suit) + 4 down (one per suit)
  const foundations: AlgerianPatienceState["foundations"] = [];
  for (const suit of SUITS) foundations.push({ suit, direction: "up", cards: [] });
  for (const suit of SUITS) foundations.push({ suit, direction: "down", cards: [] });

  // Deal 8 tableau columns of 4 face-up cards = 32
  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    tableau.push(deck.slice(idx, idx + 4));
    idx += 4;
  }

  // Rest to stock (72 cards)
  const stock = deck.slice(idx);

  return {
    tableau,
    foundations,
    stock,
    waste: [],
    recyclesLeft: 2,
    score: 0,
    movesMade: 0,
    won: false,
  };
}

function totalOnFoundations(f: AlgerianPatienceState["foundations"]): number {
  return f.reduce((s, ff) => s + ff.cards.length, 0);
}

export function reducer(state: AlgerianPatienceState, action: AlgerianPatienceAction): AlgerianPatienceState {
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
      let newWaste = [...state.waste];

      if (fromType === "tableau") {
        const col = newTableau[fromIdx];
        if (!col || col.length === 0) return state;
        card = col[col.length - 1]!;
        newTableau[fromIdx] = col.slice(0, -1);
      } else {
        if (state.waste.length === 0) return state;
        card = newWaste[newWaste.length - 1]!;
        newWaste = newWaste.slice(0, -1);
      }

      const f = state.foundations[foundIdx];
      if (!f || f.suit !== card.suit) return state;
      const next = foundationNext(f);
      if (next === null || card.rank !== next) return state;

      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card!] } : ff,
      );
      const total = totalOnFoundations(newFoundations);

      return {
        ...state,
        tableau: newTableau,
        waste: newWaste,
        foundations: newFoundations,
        score: state.score + 5,
        movesMade: state.movesMade + 1,
        won: total === 104,
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
      if (to.length > 0 && !canTableauStack(to[to.length - 1]!, card)) return state;
      const newTableau = state.tableau.map((col, i) => {
        if (i === fromCol) return col.slice(0, -1);
        if (i === toCol) return [...col, card];
        return [...col];
      });
      return { ...state, tableau: newTableau, movesMade: state.movesMade + 1 };
    }

    case "move-waste-to-tableau": {
      const { toCol } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const to = state.tableau[toCol];
      if (!to) return state;
      if (to.length > 0 && !canTableauStack(to[to.length - 1]!, card)) return state;
      const newTableau = state.tableau.map((col, i) =>
        i === toCol ? [...col, card] : [...col],
      );
      return {
        ...state,
        tableau: newTableau,
        waste: state.waste.slice(0, -1),
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AlgerianPatienceState): { score: number } | null {
  if (totalOnFoundations(state.foundations) !== 104) return null;
  return { score: state.score };
}
