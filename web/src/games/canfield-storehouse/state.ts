import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, rankVal } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CanfieldStorehouseState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type CanfieldStorehouseAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/**
 * Canfield Storehouse: foundations start at 2, wrapping through Ace.
 * Storehouse (reserve) is 13 face-up cards dealt in a row, freely accessible.
 * Tableau builds alternate-color descending (like regular Canfield).
 */
export const storehouseRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "tableau") return klondikeTableauStack(target, moving);
    if (target.kind === "foundation") {
      if (moving.length !== 1) return false;
      const c = moving[0]!;
      if (target.cards.length === 0) return (c.rank as number) === 2;
      const top = target.cards[target.cards.length - 1]!;
      if (top.suit !== c.suit) return false;
      // Wrap: after King comes Ace
      const expected = top.rank === 13 ? 1 : (top.rank as number) + 1;
      return (c.rank as number) === expected;
    }
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "stock") return false;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number): CanfieldStorehouseState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Remove the four 2s and place them on foundations
  const twos: Card[] = [];
  const rest: Card[] = [];
  for (const card of deck) {
    if ((card.rank as number) === 2) {
      twos.push(card);
    } else {
      rest.push(card);
    }
  }

  // Foundation piles start with the four 2s
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: [twos[i]!] });
  }

  // Storehouse: 13 face-up cards in a row (freecell kind so they're individually accessible)
  const storehouseCards = rest.slice(0, 13);
  for (let i = 0; i < 13; i++) {
    piles.push({ id: `s${i + 1}`, kind: "freecell", cards: [storehouseCards[i]!] });
  }

  // Tableau: 4 columns, 1 card each face-up
  const afterStorehouse = rest.slice(13);
  for (let i = 0; i < 4; i++) {
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards: [afterStorehouse[i]!],
      faceUpCount: 1,
    });
  }

  // Stock: remaining cards
  const stockCards = afterStorehouse.slice(4);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  return { piles, score: 0, movesMade: 0, won: false };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalCardsOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

const STOREHOUSE_IDS = Array.from({ length: 13 }, (_, i) => `s${i + 1}`);

export function reducer(
  state: CanfieldStorehouseState,
  action: CanfieldStorehouseAction,
): CanfieldStorehouseState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      // Draw 3 like Canfield
      const toDraw = Math.min(3, ns.cards.length);
      const drawn = ns.cards.splice(ns.cards.length - toDraw, toDraw);
      for (let i = drawn.length - 1; i >= 0; i--) {
        nw.cards.push(drawn[i]!);
      }
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length > 0 || waste.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      ns.cards = [...nw.cards].reverse();
      nw.cards = [];
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, storehouseRuleset)) return state;

      const toP = getPile(state.piles, toPile);
      if (!toP) return state;
      let scoreDelta = 0;
      if (toP.kind === "foundation") scoreDelta = 10;

      const newPiles = applyMove(state.piles, move);

      // Auto-fill: if a tableau column is now empty try to fill from waste, else leave empty
      // (classic Canfield fills from reserve; storehouse variant fills from waste or stock)
      const won = totalCardsOnFoundations(newPiles) === 52;
      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let score = state.score;
      let moved = true;
      const sourceIds = ["waste", ...TABLEAU_IDS, ...STOREHOUSE_IDS];
      while (moved) {
        moved = false;
        for (const srcId of sourceIds) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const mv = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, mv, storehouseRuleset)) {
              piles = applyMove(piles, mv);
              moves++;
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return { ...state, piles, movesMade: moves, score, won: totalCardsOnFoundations(piles) === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CanfieldStorehouseState): { score: number } | null {
  // Win: all 52 cards on foundations (including the 4 initial 2s = 52 total)
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

// expose for use in component
export { rankVal };
