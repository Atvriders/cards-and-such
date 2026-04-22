import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, klondikeTableauStack, freecellCellStack } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GateSettings {
  _dummy?: undefined;
}

export interface GateState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: GateSettings;
}

export type GateAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5"] as const;
const CELL_IDS = ["fc1", "fc2"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const gateRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    return klondikeTableauStack(target, moving);
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? pile.cards.length;
    if (count > faceUp) return false;
    // Valid alt-color descending sequence
    const cards = pile.cards.slice(pile.cards.length - count);
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i]!;
      const b = cards[i + 1]!;
      const aRed = a.suit === "♥" || a.suit === "♦";
      const bRed = b.suit === "♥" || b.suit === "♦";
      if (aRed === bRed) return false;
      if (a.rank !== b.rank + 1) return false;
    }
    return true;
  },
};

export function initialState(seed: number, settings: GateSettings): GateState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 5 cascades, 7 cards each (35 total), all face-up
  for (let i = 0; i < 5; i++) {
    const cards = deck.slice(idx, idx + 7);
    idx += 7;
    piles.push({ id: CASCADE_IDS[i]!, kind: "tableau", cards, faceUpCount: 7 });
  }

  // 2 free cells, each with 1 card
  for (let i = 0; i < 2; i++) {
    piles.push({ id: CELL_IDS[i]!, kind: "freecell", cards: [deck[idx++]!] });
  }

  // 4 foundations, empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  // Remaining cards: 52 - 35 - 2 = 15 cards go in reserve / extra cascade "gate"
  // Actually 52-37=15 go to stock for simplicity
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

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

export function reducer(state: GateState, action: GateAction): GateState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, gateRuleset)) return state;

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
            if (canMove(piles, move, gateRuleset)) {
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

export function isTerminal(state: GateState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
