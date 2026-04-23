import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, freecellCellStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankVal } from "../../engines/tableau/moves.js";

export interface SeaTowersState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type SeaTowersAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Sea Towers tableau: build down, SAME SUIT. Empty columns accept Kings only. */
const seaTowersTableauStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) {
    // Only Kings may fill empty columns
    return bottom.rank === 13;
  }
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
};

export const seaTowersRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return seaTowersTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return false;
    if (pile.kind === "tableau") {
      if (count > (pile.faceUpCount ?? 0)) return false;
      // Must be same-suit descending sequence
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i]!;
        const b = cards[i + 1]!;
        if (a.suit !== b.suit) return false;
        if (rankVal(a) !== rankVal(b) + 1) return false;
      }
      return true;
    }
    return false;
  },
};

export function initialState(seed: number): SeaTowersState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  // 10 cascades of 5 cards each (50 total), all face-up
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const cards = deck.slice(idx, idx + 5);
    idx += 5;
    piles.push({ id: CASCADE_IDS[i]!, kind: "tableau", cards, faceUpCount: 5 });
  }

  // 2 remaining cards pre-fill first 2 free cells
  for (let i = 0; i < 4; i++) {
    if (i < 2) {
      piles.push({ id: FREECELL_IDS[i]!, kind: "freecell", cards: [deck[idx++]!] });
    } else {
      piles.push({ id: FREECELL_IDS[i]!, kind: "freecell", cards: [] });
    }
  }

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

export function reducer(state: SeaTowersState, action: SeaTowersAction): SeaTowersState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, seaTowersRuleset)) return state;
      const newPiles = applyMove(state.piles, move);
      const newTotal = totalCardsOnFoundations(newPiles);
      const won = newTotal === 52;
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: state.score + (getPile(state.piles, toPile)?.kind === "foundation" ? 10 : 0),
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let score = state.score;
      let moved = true;

      while (moved) {
        moved = false;
        const sourceIds = [...CASCADE_IDS, ...FREECELL_IDS];
        for (const sourceId of sourceIds) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, seaTowersRuleset)) {
              piles = applyMove(piles, move);
              moves += 1;
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;
      const won = totalCardsOnFoundations(piles) === 52;
      return { ...state, piles, movesMade: moves, score, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SeaTowersState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}
