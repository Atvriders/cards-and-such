import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DemonSettings {
  _dummy?: undefined;
}

/** Demon (British name for Canfield): 13-card reserve, 4 tableau columns,
 *  4 foundations that start on the rank of the first reserve card, build up by suit (wrapping).
 *  Tableau builds down in alternating colors; deal 3 at a time from stock. */
export interface DemonState {
  reserve: Card[];
  tableau: Card[][];
  foundations: { suit: string; baseRank: number; cards: Card[] }[];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type DemonAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move-to-foundation"; fromType: "tableau" | "waste" | "reserve"; fromIdx: number; foundIdx: number }
  | { type: "move-tableau"; fromCol: number; toCol: number; count: number }
  | { type: "move-waste-to-tableau"; toCol: number }
  | { type: "move-reserve-to-tableau"; toCol: number };

function rankPlusN(rank: number, n: number): number {
  return ((rank - 1 + n) % 13) + 1;
}

function foundationNext(baseRank: number, cards: Card[]): number {
  if (cards.length === 0) return baseRank;
  return rankPlusN(cards[cards.length - 1]!.rank, 1);
}

function canStackTableau(top: Card, moving: Card): boolean {
  const topIsRed = top.suit === "♥" || top.suit === "♦";
  const movIsRed = moving.suit === "♥" || moving.suit === "♦";
  if (topIsRed === movIsRed) return false;
  return moving.rank === top.rank - 1;
}

export function initialState(seed: number, _settings: DemonSettings): DemonState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // 13-card reserve
  const reserve = deck.slice(0, 13);
  // Foundation base rank = rank of top reserve card
  const baseRank = reserve[reserve.length - 1]!.rank;

  // 4 tableau columns of 4 cards each (only top face-up in traditional rules, but we show all)
  const tableau: Card[][] = [];
  let idx = 13;
  for (let i = 0; i < 4; i++) {
    tableau.push(deck.slice(idx, idx + 4));
    idx += 4;
  }

  // Foundations (4, by suit, starting at baseRank)
  const foundations = SUITS.map((suit) => ({ suit, baseRank, cards: [] as Card[] }));

  // First foundation: place the top reserve card if it matches (automatic)
  // Actually in standard Demon, place the TOP of the reserve onto the first foundation spot to start
  // We'll handle this manually - start with empty foundations

  // Stock: rest
  const stock = deck.slice(idx);

  return {
    reserve,
    tableau,
    foundations,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
  };
}

function totalOnFoundations(f: DemonState["foundations"]): number {
  return f.reduce((s, ff) => s + ff.cards.length, 0);
}

export function reducer(state: DemonState, action: DemonAction): DemonState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const drawCount = Math.min(3, state.stock.length);
      const newStock = [...state.stock];
      const drawn = newStock.splice(newStock.length - drawCount, drawCount);
      const newWaste = [...state.waste, ...drawn.reverse()];
      return { ...state, stock: newStock, waste: newWaste, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      if (state.stock.length > 0 || state.waste.length === 0) return state;
      return {
        ...state,
        stock: [...state.waste].reverse(),
        waste: [],
        movesMade: state.movesMade + 1,
      };
    }

    case "move-to-foundation": {
      const { fromType, fromIdx, foundIdx } = action;
      let card: Card | undefined;
      let newTableau = state.tableau.map((c) => [...c]);
      let newWaste = [...state.waste];
      let newReserve = [...state.reserve];

      if (fromType === "tableau") {
        const col = newTableau[fromIdx];
        if (!col || col.length === 0) return state;
        card = col[col.length - 1]!;
        newTableau[fromIdx] = col.slice(0, -1);
      } else if (fromType === "waste") {
        if (state.waste.length === 0) return state;
        card = newWaste[newWaste.length - 1]!;
        newWaste = newWaste.slice(0, -1);
      } else {
        if (state.reserve.length === 0) return state;
        card = newReserve[newReserve.length - 1]!;
        newReserve = newReserve.slice(0, -1);
      }

      const f = state.foundations[foundIdx];
      if (!f || f.suit !== card.suit) return state;
      if (card.rank !== foundationNext(f.baseRank, f.cards)) return state;

      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card!] } : ff,
      );

      // Auto-fill tableau from reserve after any foundation move
      let autoTableau = newTableau;
      let autoReserve = newReserve.length > 0 ? newReserve : state.reserve.length > 0 ? [...state.reserve] : [];
      if (fromType !== "reserve") autoReserve = [...state.reserve];
      if (fromType === "reserve") autoReserve = newReserve;

      // Fill empty tableau columns from reserve
      if (autoReserve.length > 0) {
        for (let ci = 0; ci < autoTableau.length; ci++) {
          if (autoTableau[ci]!.length === 0 && autoReserve.length > 0) {
            const fillCard = autoReserve.pop()!;
            autoTableau = autoTableau.map((col, i) => i === ci ? [fillCard] : col);
          }
        }
      }

      const total = totalOnFoundations(newFoundations);

      return {
        ...state,
        tableau: autoTableau,
        reserve: autoReserve,
        waste: newWaste,
        foundations: newFoundations,
        score: state.score + 5,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "move-tableau": {
      const { fromCol, toCol, count } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || from.length < count) return state;
      if (!to) return state;
      const moving = from.slice(from.length - count);
      // Verify sequence
      for (let i = 0; i < moving.length - 1; i++) {
        if (!canStackTableau(moving[i]!, moving[i + 1]!)) return state;
      }
      if (to.length > 0) {
        if (!canStackTableau(to[to.length - 1]!, moving[0]!)) return state;
      }
      const newTableau = state.tableau.map((col, i) => {
        if (i === fromCol) return col.slice(0, -count);
        if (i === toCol) return [...col, ...moving];
        return [...col];
      });
      // Fill empty slots from reserve
      let autoTableau = newTableau;
      let autoReserve = [...state.reserve];
      for (let ci = 0; ci < autoTableau.length; ci++) {
        if (autoTableau[ci]!.length === 0 && autoReserve.length > 0) {
          const fillCard = autoReserve.pop()!;
          autoTableau = autoTableau.map((col, i) => i === ci ? [fillCard] : col);
        }
      }
      return { ...state, tableau: autoTableau, reserve: autoReserve, movesMade: state.movesMade + 1 };
    }

    case "move-waste-to-tableau": {
      const { toCol } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const to = state.tableau[toCol];
      if (!to) return state;
      if (to.length > 0 && !canStackTableau(to[to.length - 1]!, card)) return state;
      const newTableau = state.tableau.map((col, i) =>
        i === toCol ? [...col, card] : [...col],
      );
      const newWaste = state.waste.slice(0, -1);
      return { ...state, tableau: newTableau, waste: newWaste, movesMade: state.movesMade + 1 };
    }

    case "move-reserve-to-tableau": {
      const { toCol } = action;
      if (state.reserve.length === 0) return state;
      const card = state.reserve[state.reserve.length - 1]!;
      const to = state.tableau[toCol];
      if (!to) return state;
      if (to.length > 0 && !canStackTableau(to[to.length - 1]!, card)) return state;
      const newTableau = state.tableau.map((col, i) =>
        i === toCol ? [...col, card] : [...col],
      );
      const newReserve = state.reserve.slice(0, -1);
      return { ...state, tableau: newTableau, reserve: newReserve, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DemonState): { score: number } | null {
  if (totalOnFoundations(state.foundations) !== 52) return null;
  return { score: state.score };
}
