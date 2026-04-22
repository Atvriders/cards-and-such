import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, freecellCellStack } from "../../engines/tableau/moves.js";
import { isRed, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankVal } from "../../engines/tableau/moves.js";

export interface YukonCellsSettings {
  _dummy?: undefined;
}

export interface YukonCellsState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: YukonCellsSettings;
}

export type YukonCellsAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const CELL_IDS = ["fc1", "fc2", "fc3", "fc4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const yukonCellsRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return bottom.rank === 13; // only Kings to empty
    const top = target.cards[target.cards.length - 1]!;
    return isRed(top.suit) !== isRed(bottom.suit) && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    // Yukon rule: any face-up card can be picked up with everything on top of it
    return count <= faceUp;
  },
};

export function initialState(seed: number, settings: YukonCellsSettings): YukonCellsState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // Same deal as Yukon: col i gets (i+1) face-down + 4 extra face-up (cols 2-7)
  for (let i = 0; i < 7; i++) {
    const faceDownCount = i;
    const baseCount = i + 1;
    const extraFaceUp = i === 0 ? 0 : 4;
    const totalCards = baseCount + extraFaceUp;
    const cards = deck.slice(idx, idx + totalCards);
    idx += totalCards;
    const faceUp = totalCards - faceDownCount;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: faceUp });
  }

  // 4 free cells, empty
  for (const id of CELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
  }

  // 4 foundations, empty
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

export function reducer(state: YukonCellsState, action: YukonCellsAction): YukonCellsState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, yukonCellsRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const toP = getPile(state.piles, toPile);
      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP?.kind === "foundation" ? 10 : 0),
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
        const sourceIds = [...TABLEAU_IDS, ...CELL_IDS];
        for (const sourceId of sourceIds) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, yukonCellsRuleset)) {
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

export function isTerminal(state: YukonCellsState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
