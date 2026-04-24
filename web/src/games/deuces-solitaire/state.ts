import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Deuces Solitaire:
 * - Single deck
 * - All four 2s are immediately placed on the four foundations to start
 * - Foundations build 2-3-4-5-6-7-8-9-10-J-Q-K-A (wrapping, Ace follows King)
 * - Tableau: 10 columns, 4-5 cards each, all face-up
 * - No stock — all cards visible from the start (like FreeCell)
 * - Tableau builds alternating-color descending (like Klondike)
 * - One card moves at a time
 */
export interface DeucesSolitaireState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
}

export type DeucesSolitaireAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Deuces: foundations wrap 2..K..A. Tableau: alt-color descending. */
export const deucesRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") {
      if (moving.length !== 1) return false;
      const c = moving[0]!;
      if (target.cards.length === 0) return (c.rank as number) === 2;
      const top = target.cards[target.cards.length - 1]!;
      if (top.suit !== c.suit) return false;
      // Wrapping: A follows K
      const expected = top.rank === 13 ? 1 : (top.rank as number) + 1;
      return (c.rank as number) === expected;
    }
    if (target.kind === "tableau") {
      return klondikeTableauStack(target, moving);
    }
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number): DeucesSolitaireState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Separate the 4 twos from the rest
  const twos: typeof deck = [];
  const rest: typeof deck = [];
  for (const card of deck) {
    if ((card.rank as number) === 2) {
      twos.push(card);
    } else {
      rest.push(card);
    }
  }

  const piles: Pile[] = [];

  // Foundations start with the 2s
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation" as const, cards: [twos[i]!] });
  }

  // 10 tableau columns: first 8 get 5 cards, last 2 get 4 cards (total 48 = rest.length)
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const count = i < 8 ? 5 : 4;
    const cards = rest.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau" as const,
      cards,
      faceUpCount: count,
    });
  }

  return { piles, movesMade: 0, won: false };
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

export function reducer(
  state: DeucesSolitaireState,
  action: DeucesSolitaireAction,
): DeucesSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, deucesRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const won = totalCardsOnFoundations(newPiles) === 52;
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1, won };
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
            const mv = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, mv, deucesRuleset)) {
              piles = applyMove(piles, mv);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return { ...state, piles, movesMade: moves, won: totalCardsOnFoundations(piles) === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DeucesSolitaireState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: Math.max(0, 300 - state.movesMade) };
}
