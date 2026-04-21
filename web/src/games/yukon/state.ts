import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { isRed, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface YukonSettings {
  _dummy?: undefined;
}

export interface YukonState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: YukonSettings;
}

export type YukonAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const yukonRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return bottom.rank === 13; // only Kings to empty
    const top = target.cards[target.cards.length - 1]!;
    // Alternating colors, descending
    return isRed(top.suit) !== isRed(bottom.suit) && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    // Yukon: any face-up card can be picked up with the cards on top of it
    return count <= faceUp;
    // No requirement that they form a valid sequence!
  },
};

export function initialState(seed: number, settings: YukonSettings): YukonState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Column sizes: 1, 5, 6, 7, 8, 9, 10 (total = 46 + ? ... actually 1+5+6+7+8+9+10 = 46; but 52 total)
  // Wait: 1+4+5+6+7+8+9 = 40? No.
  // Standard Yukon: col 1: 1 card; cols 2-7: (col_i) face-up cards + some face-down
  // Typical: 1 card col 1 (all face-up); col 2: 1 face-down + 4 face-up; col 3: 2FD + 4FU; etc.
  // Total: 1 + (1+4) + (2+4) + (3+4) + (4+4) + (5+4) + (6+4) = 1+5+6+7+8+9+10 = 46
  // Remaining: 52 - 46 = 6 cards... that doesn't work.
  // Actually standard Yukon deals ALL 52 cards to tableau:
  // Col 1: 1 card; Col 2: 5 cards (1FD+4FU); Col 3: 6 (2FD+4FU); ... Col 7: 10 (6FD+4FU)
  // Total: 1+5+6+7+8+9+10 = 46. That's only 46.
  // Better known distribution: col sizes 1,2,3,4,5,6,7 = 28, then 24 extra cards dealt face-up
  // to cols 2-7 (4 each) = 24. Total = 28+24 = 52. Yes.

  const piles: Pile[] = [];
  let idx = 0;

  for (let i = 0; i < 7; i++) {
    const faceDownCount = i; // 0,1,2,3,4,5,6
    const baseCount = i + 1; // 1,2,3,4,5,6,7
    const extraFaceUp = i === 0 ? 0 : 4; // col1 gets no extra, rest get 4 extra face-up
    const totalCards = baseCount + extraFaceUp;
    const cards = deck.slice(idx, idx + totalCards);
    idx += totalCards;
    // faceUpCount: col1 = 1 (just the top), others: 4+1 = 5? Actually:
    // faceDownCount cards face-down + rest face-up
    const faceUp = totalCards - faceDownCount;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: faceUp,
    });
  }

  // Foundations
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

export function reducer(state: YukonState, action: YukonAction): YukonState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, yukonRuleset)) return state;

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
            if (canMove(piles, move, yukonRuleset)) {
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

export function isTerminal(state: YukonState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
