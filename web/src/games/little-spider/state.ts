import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LittleSpiderSettings {
  _dummy?: undefined;
}

export interface LittleSpiderState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: LittleSpiderSettings;
}

export type LittleSpiderAction =
  | { type: "deal-row" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// 8 tableau columns, 2 foundations for red suits (Aces up), 2 foundations for black (Kings down)
const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"] as const;
// f1, f2: red foundations (Ace up: Hearts, Diamonds)
// f3, f4: black foundations (King down: Spades, Clubs)
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

// Little Spider has 2 foundations that build up (A→K) and 2 that build down (K→A)
// The red suits build up from Ace, the black suits build down from King
export const littleSpiderRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind !== "foundation") return false;
    if (moving.length !== 1) return false;
    const c = moving[0]!;
    // f1 = Hearts (red, up from Ace)
    // f2 = Diamonds (red, up from Ace)
    // f3 = Spades (black, down from King)
    // f4 = Clubs (black, down from King)
    const fi = target.id; // "f1", "f2", "f3", "f4"
    const isRedFound = fi === "f1" || fi === "f2";
    const suit = fi === "f1" ? "♥" : fi === "f2" ? "♦" : fi === "f3" ? "♠" : "♣";
    if (c.suit !== suit) return false;
    if (isRedFound) {
      // Build up A→K
      if (target.cards.length === 0) return c.rank === 1;
      const top = target.cards[target.cards.length - 1]!;
      return (c.rank as number) === (top.rank as number) + 1;
    } else {
      // Build down K→A
      if (target.cards.length === 0) return c.rank === 13;
      const top = target.cards[target.cards.length - 1]!;
      return (c.rank as number) === (top.rank as number) - 1;
    }
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "tableau") return count === 1; // only top card
    if (pile.kind === "foundation") return count === 1;
    return false;
  },
};

// Tableau rule: can move a card from/to tableau during dealing phase
// Actually Little Spider tableau: build onto tableau during dealing — adjacent rank, any suit
const tableauRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return littleSpiderRuleset.canStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    if (target.cards.length === 0) return false; // can't move to empty tableau
    const bottom = moving[0]!;
    const top = target.cards[target.cards.length - 1]!;
    const diff = Math.abs((top.rank as number) - (bottom.rank as number));
    return diff === 1 || diff === 12; // adjacent rank, any suit
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "tableau") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    return false;
  },
};

export function initialState(seed: number, settings: LittleSpiderSettings): LittleSpiderState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // 8 tableau piles start empty
  for (const id of TABLEAU_IDS) {
    piles.push({ id, kind: "tableau", cards: [], faceUpCount: 0 });
  }

  // 4 foundations: f1=Hearts(up), f2=Diamonds(up), f3=Spades(down), f4=Clubs(down)
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  // Stock: all 52 cards — deal 8 at a time (one to each tableau)
  piles.push({ id: "stock", kind: "stock", cards: deck, faceUpCount: 0 });

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: LittleSpiderState, action: LittleSpiderAction): LittleSpiderState {
  if (state.won) return state;

  switch (action.type) {
    case "deal-row": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length === 0) return state;
      // Deal up to 8 cards face-up, one to each tableau
      const dealCount = Math.min(8, stock.cards.length);
      let newStock = [...stock.cards];
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      for (let i = 0; i < dealCount; i++) {
        const card = newStock.shift()!;
        const tab = newPiles.find((p) => p.id === TABLEAU_IDS[i])!;
        tab.cards.push(card);
        tab.faceUpCount = (tab.faceUpCount ?? 0) + 1;
      }
      const stockPile = newPiles.find((p) => p.id === "stock")!;
      stockPile.cards = newStock;
      return { ...state, piles: newPiles };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      // Use tableau ruleset for tableau-to-tableau, foundation ruleset for foundation moves
      const toPileObj = getPile(state.piles, toPile);
      const ruleset = toPileObj?.kind === "foundation" ? littleSpiderRuleset : tableauRuleset;
      if (!canMove(state.piles, { fromPile, toPile, count }, ruleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        for (const srcId of TABLEAU_IDS) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const m = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, m, littleSpiderRuleset)) {
              piles = applyMove(piles, m);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      return { ...state, piles, movesMade: moves, score: total, won: total === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: LittleSpiderState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
