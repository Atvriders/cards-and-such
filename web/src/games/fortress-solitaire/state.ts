import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FortressState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
}

export type FortressAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const COLUMN_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Fortress: same-suit, adjacent rank (up or down) on tableau. Empty column accepts any card. */
export const fortressRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    if (top.suit !== card.suit) return false;
    const diff = Math.abs((card.rank as number) - (top.rank as number));
    return diff === 1;
  },
  canPickUp: (_pile, count) => count === 1,
};

export function initialState(seed: number): FortressState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Deal 52 cards across 10 columns: 5 cards each, all face-up
  // 10 columns × 5 = 50 cards; 2 columns get 6 cards (first 2)
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const count = i < 2 ? 6 : 5;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: COLUMN_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: count,
    });
  }

  // Foundations: empty
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

export function reducer(state: FortressState, action: FortressAction): FortressState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, fortressRuleset)) return state;
      const newPiles = applyMove(state.piles, move);
      const won = totalCardsOnFoundations(newPiles) === 52;
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1, won };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        for (const sourceId of COLUMN_IDS) {
          const src = getPile(piles, sourceId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const mv = { fromPile: sourceId, toPile: fId, count: 1 };
            if (canMove(piles, mv, fortressRuleset)) {
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

export function isTerminal(state: FortressState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: Math.max(0, 200 - state.movesMade) };
}
