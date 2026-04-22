import type { Pile } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CarpetSettings {
  _dummy?: undefined;
}

export interface CarpetState {
  /**
   * Carpet solitaire:
   * - 5×4 grid of 20 face-up cards ("carpet") — these are temporary holding spots.
   * - 4 foundations (f1–f4): build Ace to King in suit.
   * - 4 free cells (c1–c4): each hold one card.
   * - Stock: remaining 28 cards, flipped one at a time.
   * - Empty grid spots auto-refill from stock after each move.
   */
  piles: Pile[];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: CarpetSettings;
}

export type CarpetAction =
  | { type: "draw" }
  | { type: "play-to-foundation"; fromPile: string; toPile: string }
  | { type: "play-to-cell"; fromPile: string; toPile: string }
  | { type: "play-cell-to-foundation"; fromCell: string; toPile: string }
  | { type: "auto-refill" };

const FOUNDATION_IDS = ["f1","f2","f3","f4"] as const;
const CELL_IDS = ["c1","c2","c3","c4"] as const;
// 20 grid positions
const GRID_IDS: string[] = [];
for (let i = 0; i < 20; i++) GRID_IDS.push(`g${i + 1}`);

/** Foundation: Ace to King in same suit. */
function canBuildFoundation(foundation: Pile, card: Card): boolean {
  if (foundation.kind !== "foundation") return false;
  if (foundation.cards.length === 0) return card.rank === 1;
  const top = foundation.cards[foundation.cards.length - 1]!;
  return top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number);
}

export function initialState(seed: number, settings: CarpetSettings): CarpetState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // 20 grid positions, each holds 1 card face-up
  for (let i = 0; i < 20; i++) {
    piles.push({
      id: GRID_IDS[i]!,
      kind: "tableau",
      cards: [deck[i]!],
      faceUpCount: 1,
    });
  }

  // 4 foundations (empty)
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  // 4 free cells (empty)
  for (const id of CELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
  }

  // Stock: remaining 32 cards (52 - 20)
  const stock = deck.slice(20);

  return {
    piles,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
    settings,
  };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

/** Refill empty grid spots from stock. Returns updated piles and stock. */
function refillGrid(piles: Pile[], stock: Card[]): { piles: Pile[]; stock: Card[] } {
  let newStock = [...stock];
  const newPiles = piles.map((p) => ({ ...p, cards: [...p.cards] }));

  for (const gid of GRID_IDS) {
    const gp = newPiles.find((p) => p.id === gid)!;
    if (gp.cards.length === 0 && newStock.length > 0) {
      const card = newStock.shift()!;
      gp.cards.push(card);
      gp.faceUpCount = 1;
    }
  }

  return { piles: newPiles, stock: newStock };
}

export function reducer(state: CarpetState, action: CarpetAction): CarpetState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) {
        // Redeal from waste
        if (state.waste.length === 0) return state;
        return {
          ...state,
          stock: [...state.waste].reverse(),
          waste: [],
          movesMade: state.movesMade + 1,
        };
      }
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return {
        ...state,
        stock: newStock,
        waste: [...state.waste, card],
        movesMade: state.movesMade + 1,
      };
    }

    case "play-to-foundation": {
      const { fromPile, toPile } = action;

      // Source can be grid, cell, or waste
      let card: Card | null = null;
      let sourceCards: Card[] = [];

      if (fromPile === "waste") {
        if (state.waste.length === 0) return state;
        card = state.waste[state.waste.length - 1]!;
        sourceCards = state.waste.slice(0, -1);
      } else {
        const from = getPile(state.piles, fromPile);
        if (!from || from.cards.length === 0) return state;
        card = from.cards[from.cards.length - 1]!;
        sourceCards = from.cards.slice(0, -1);
      }

      const to = getPile(state.piles, toPile);
      if (!to || !canBuildFoundation(to, card)) return state;

      let newPiles = state.piles.map((p) => {
        if (p.id === toPile) return { ...p, cards: [...p.cards, card!] };
        if (p.id === fromPile && fromPile !== "waste") {
          return { ...p, cards: sourceCards, faceUpCount: sourceCards.length > 0 ? 1 : 0 };
        }
        return p;
      });

      let newWaste = fromPile === "waste" ? sourceCards : state.waste;

      // Refill grid from stock
      const { piles: refilled, stock: newStock } = refillGrid(newPiles, state.stock);
      newPiles = refilled;

      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        stock: newStock,
        waste: newWaste,
        score: state.score + 10,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "play-to-cell": {
      const { fromPile, toPile } = action;
      const toCell = getPile(state.piles, toPile);
      if (!toCell || toCell.kind !== "freecell" || toCell.cards.length > 0) return state;

      let card: Card | null = null;
      let newWaste = state.waste;

      if (fromPile === "waste") {
        if (state.waste.length === 0) return state;
        card = state.waste[state.waste.length - 1]!;
        newWaste = state.waste.slice(0, -1);
      } else {
        const from = getPile(state.piles, fromPile);
        if (!from || from.cards.length === 0) return state;
        card = from.cards[from.cards.length - 1]!;
      }

      const newPiles = state.piles.map((p) => {
        if (p.id === toPile) return { ...p, cards: [card!] };
        if (p.id === fromPile && fromPile !== "waste") {
          const newCards = p.cards.slice(0, -1);
          return { ...p, cards: newCards, faceUpCount: newCards.length > 0 ? 1 : 0 };
        }
        return p;
      });

      // Refill grid
      const { piles: refilled, stock: newStock } = refillGrid(newPiles, state.stock);

      return {
        ...state,
        piles: refilled,
        stock: newStock,
        waste: newWaste,
        movesMade: state.movesMade + 1,
      };
    }

    case "play-cell-to-foundation": {
      const { fromCell, toPile } = action;
      const cell = getPile(state.piles, fromCell);
      if (!cell || cell.kind !== "freecell" || cell.cards.length === 0) return state;
      const card = cell.cards[0]!;
      const to = getPile(state.piles, toPile);
      if (!to || !canBuildFoundation(to, card)) return state;

      const newPiles = state.piles.map((p) => {
        if (p.id === fromCell) return { ...p, cards: [] };
        if (p.id === toPile) return { ...p, cards: [...p.cards, card] };
        return p;
      });

      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + 10,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-refill": {
      const { piles: refilled, stock: newStock } = refillGrid(state.piles, state.stock);
      if (refilled === state.piles) return state;
      return { ...state, piles: refilled, stock: newStock };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CarpetState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

export { canBuildFoundation, FOUNDATION_IDS, CELL_IDS, GRID_IDS };
