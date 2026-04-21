import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack, freecellCellStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { freecellSettings } from "./index.js";

export interface FreeCellState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type FreeCellAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const freecellRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return klondikeTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      // All picked cards must form a valid descending alt-color sequence
      if (count > pile.cards.length) return false;
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const upper = cards[i]!;
        const lower = cards[i + 1]!;
        const upperIsRed = upper.suit === "♥" || upper.suit === "♦";
        const lowerIsRed = lower.suit === "♥" || lower.suit === "♦";
        if (upperIsRed === lowerIsRed) return false;
        if (upper.rank !== lower.rank + 1) return false;
      }
      return true;
    }
    return false;
  },
};

function makeRuleset(): Ruleset {
  return freecellRuleset;
}

function countEmptyFreeCells(piles: Pile[]): number {
  return FREECELL_IDS.filter((id) => {
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function countEmptyCascades(piles: Pile[], excludeId?: string): number {
  return CASCADE_IDS.filter((id) => {
    if (id === excludeId) return false;
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function maxMoveable(piles: Pile[], toPileId: string): number {
  const emptyCells = countEmptyFreeCells(piles);
  // Don't count the destination as an empty cascade
  const emptyCascades = countEmptyCascades(piles, toPileId as typeof CASCADE_IDS[number]);
  return (1 + emptyCells) * Math.pow(2, emptyCascades);
}

export function initialState(
  seed: number,
  _settings: SettingsOf<typeof freecellSettings>,
): FreeCellState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Deal 52 cards across 8 cascades: first 4 get 7, last 4 get 6
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    const count = i < 4 ? 7 : 6;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: CASCADE_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: count, // All face-up in FreeCell
    });
  }

  // Free cells: empty
  for (const id of FREECELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
  }

  // Foundations: empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 52, movesMade: 0, won: false };
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
  state: FreeCellState,
  action: FreeCellAction,
): FreeCellState {
  if (state.won) return state;

  const ruleset = makeRuleset();

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };

      // Check max-moveable constraint for multi-card moves
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;

      if (!canMove(state.piles, move, ruleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const toP = getPile(state.piles, toPile);
      if (!toP) return state;

      const newTotal = totalCardsOnFoundations(newPiles);
      const won = newTotal === 52;
      const newMoves = state.movesMade + 1;

      return {
        ...state,
        piles: newPiles,
        movesMade: newMoves,
        score: Math.max(0, 52 - newMoves),
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;

      while (moved) {
        moved = false;
        const sourceIds = [...CASCADE_IDS, ...FREECELL_IDS];
        for (const sourceId of sourceIds) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, ruleset)) {
              piles = applyMove(piles, move);
              moves += 1;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;

      const newTotal = totalCardsOnFoundations(piles);
      const won = newTotal === 52;

      return {
        ...state,
        piles,
        movesMade: moves,
        score: Math.max(0, 52 - moves),
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FreeCellState): { score: number } | null {
  const total = FOUNDATION_IDS.reduce((sum, id) => {
    const p = state.piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
  if (total !== 52) return null;
  return { score: Math.max(0, state.score) };
}
