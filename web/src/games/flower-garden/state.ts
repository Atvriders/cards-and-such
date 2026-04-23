import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankVal } from "../../engines/tableau/moves.js";

export interface FlowerGardenState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type FlowerGardenAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;
const GARDEN_ID = "garden";

/** Flower Garden tableau: build down any suit, single card only. Empty columns accept any card. */
const flowerTableauStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "tableau") return false;
  if (moving.length !== 1) return false;
  const card = moving[0]!;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return rankVal(top) === rankVal(card) + 1;
};

export const flowerGardenRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return flowerTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "tableau") {
      return (pile.faceUpCount ?? 0) >= 1;
    }
    // Garden: top card only
    if (pile.kind === "stock") return pile.cards.length > 0;
    return false;
  },
};

export function initialState(seed: number): FlowerGardenState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  // 6 bouquet tableau columns of 6 cards each, all face-up
  let idx = 0;
  for (let i = 0; i < 6; i++) {
    const cards = deck.slice(idx, idx + 6);
    idx += 6;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 6 });
  }

  // 16-card garden reserve (stock kind, top-card-only accessible)
  piles.push({ id: GARDEN_ID, kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

  // 4 foundations
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

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

export function reducer(state: FlowerGardenState, action: FlowerGardenAction): FlowerGardenState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, flowerGardenRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const toP = getPile(state.piles, toPile);
      const scoreDelta = toP?.kind === "foundation" ? 10 : 0;
      const newTotal = totalCardsOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won: newTotal === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        const sourceIds = [...TABLEAU_IDS, GARDEN_ID];
        for (const sid of sourceIds) {
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, flowerGardenRuleset)) {
              piles = applyMove(piles, move);
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return {
        ...state,
        piles,
        score,
        movesMade: state.movesMade + 1,
        won: totalCardsOnFoundations(piles) === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FlowerGardenState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}
