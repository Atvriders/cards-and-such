import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * King Albert: 9 tableau columns (4,5,6,7,8,9,8,5,4 = 45+7 reserve=52),
 * no stock — all 52 cards are dealt face-up. 7 extra cards form the reserve.
 * Tableau: descending, alternating colors (like Klondike). Empty column: any card.
 * One card may be moved at a time (no multi-card stack moves without empties).
 * Reserve cards are single face-up cards accessible at any time.
 */
export interface KingAlbertState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
}

export type KingAlbertAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"] as const;
const RESERVE_IDS = ["rv1", "rv2", "rv3", "rv4", "rv5", "rv6", "rv7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const kingAlbertRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return klondikeTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1; // reserve cells
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number): KingAlbertState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Column sizes: 4,5,6,7,8,9,8,5,4  — but that's only 56. Use 4,5,6,7,8,9,6,4,3 = 52? No.
  // Standard King Albert: 9 columns: 1-9 cards each? = 45 cards + 7 reserve = 52
  // Use column sizes 1..9 (but visually we want a "spread") — classic is uneven.
  // Actually King Albert: 9 columns of sizes that total 45, e.g. 1+2+3+4+5+6+7+8+9=45.
  // 7 remaining cards go to reserve (freecell-type, one card each).
  const colSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let idx = 0;
  for (let i = 0; i < 9; i++) {
    const count = colSizes[i]!;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: count, // all face-up
    });
  }

  // Reserve: 7 cards, each in their own freecell slot
  for (let i = 0; i < 7; i++) {
    piles.push({ id: RESERVE_IDS[i]!, kind: "freecell", cards: [deck[idx++]!] });
  }

  // Foundations
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
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

export function reducer(state: KingAlbertState, action: KingAlbertAction): KingAlbertState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, kingAlbertRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const won = totalCardsOnFoundations(newPiles) === 52;
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1, won };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      const sourceIds = [...TABLEAU_IDS, ...RESERVE_IDS];
      while (moved) {
        moved = false;
        for (const srcId of sourceIds) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const mv = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, mv, kingAlbertRuleset)) {
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

export function isTerminal(state: KingAlbertState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: Math.max(0, 300 - state.movesMade) };
}
