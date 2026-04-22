import type { Pile, Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RussianSolitaireSettings {
  _dummy?: undefined;
}

export interface RussianSolitaireState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: RussianSolitaireSettings;
}

export type RussianSolitaireAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Russian Solitaire: like Yukon but tableau builds DOWN SAME-SUIT. */
export const russianRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return bottom.rank === 13; // only Kings to empty
    const top = target.cards[target.cards.length - 1]!;
    // Same suit, descending
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    // Yukon-style: any face-up card (and cards on top of it) can be moved
    return count <= faceUp;
  },
};

/**
 * Russian Solitaire deal (same structure as Yukon):
 * 7 columns. Col i (0-indexed) gets (i+1) base cards + 4 extra face-up for cols 1-6.
 * Col 0: 1 card (all face-up).
 * Cols 1-6: (i) face-down + 4+1 face-up (Yukon layout).
 * Total: 1 + (1+4) + (2+4) + (3+4) + (4+4) + (5+4) + (6+4) = 1+5+6+7+8+9+10 = 46... nope
 * Standard: col sizes 1,5,6,7,8,9,10 sums to 46; remainder 6 dealt to cols 2-7? No.
 * Use exact Yukon deal: col 0 = 1 card; cols 1-6: faceDown=i, extra 4 face-up. Total=52.
 */
export function initialState(seed: number, settings: RussianSolitaireSettings): RussianSolitaireState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  for (let i = 0; i < 7; i++) {
    const faceDownCount = i; // 0,1,2,3,4,5,6
    const extraFaceUp = i === 0 ? 0 : 4;
    const totalCards = (i + 1) + extraFaceUp;
    const cards = deck.slice(idx, idx + totalCards);
    idx += totalCards;
    const faceUp = totalCards - faceDownCount;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: faceUp,
    });
  }

  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
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

export function reducer(state: RussianSolitaireState, action: RussianSolitaireAction): RussianSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, russianRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (getPile(state.piles, toPile)?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;

      while (moved) {
        moved = false;
        for (const sourceId of TABLEAU_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, russianRuleset)) {
              piles = applyMove(piles, move);
              scoreDelta += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      const won = total === 52;

      return {
        ...state,
        piles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RussianSolitaireState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}
