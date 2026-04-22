import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, freecellCellStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EightOffSettings {
  _dummy?: undefined;
}

export interface EightOffState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: EightOffSettings;
}

export type EightOffAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] as const;
const CELL_IDS = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const eightOffRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Eight Off: build down same suit
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    if (count > pile.cards.length) return false;
    const cards = pile.cards.slice(pile.cards.length - count);
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i]!;
      const b = cards[i + 1]!;
      if (a.suit !== b.suit) return false;
      if (rankVal(a) !== rankVal(b) + 1) return false;
    }
    return true;
  },
};

export function initialState(seed: number, settings: EightOffSettings): EightOffState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 8 cascades, each with 6 cards, all face-up (6 × 8 = 48 cards)
  for (let i = 0; i < 8; i++) {
    const cards = deck.slice(idx, idx + 6);
    idx += 6;
    piles.push({ id: CASCADE_IDS[i]!, kind: "tableau", cards, faceUpCount: 6 });
  }

  // 8 free cells — deal remaining 4 cards (52-48=4) into first 4 cells
  for (let i = 0; i < 8; i++) {
    const card = idx < 52 ? [deck[idx++]!] : [];
    piles.push({ id: CELL_IDS[i]!, kind: "freecell", cards: card });
  }

  // 4 foundations
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

export function reducer(state: EightOffState, action: EightOffAction): EightOffState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, eightOffRuleset)) return state;

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
        const sourceIds = [...CASCADE_IDS, ...CELL_IDS];
        for (const sourceId of sourceIds) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, eightOffRuleset)) {
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

export function isTerminal(state: EightOffState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
