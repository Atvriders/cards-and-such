import type { Pile, Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BakersDozenSettings {
  _dummy?: undefined;
}

export interface BakersDozenState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: BakersDozenSettings;
}

export type BakersDozenAction =
  | { type: "move"; fromPile: string; toPile: string }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12","t13"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Baker's Dozen: tableau builds down any suit, one card at a time. */
export const bakersDozRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const bottom = moving[0]!;
    if (target.cards.length === 0) return true; // any card to empty
    const top = target.cards[target.cards.length - 1]!;
    // Any suit, descending by 1
    return rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    // Only one card at a time
    return count === 1;
  },
};

/** Move all Kings in a column to the bottom (index 0 of cards array = bottom). */
function sinkKings(col: Card[]): Card[] {
  const kings = col.filter((c) => c.rank === 13);
  const nonKings = col.filter((c) => c.rank !== 13);
  return [...kings, ...nonKings];
}

export function initialState(seed: number, settings: BakersDozenSettings): BakersDozenState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // 13 columns of 4 cards each = 52 cards, all face-up
  const piles: Pile[] = [];

  for (let i = 0; i < 13; i++) {
    const raw = deck.slice(i * 4, i * 4 + 4) as Card[];
    const cards = sinkKings(raw);
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 4, // all face-up
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

export function reducer(state: BakersDozenState, action: BakersDozenAction): BakersDozenState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile } = action;
      const move = { fromPile, toPile, count: 1 };
      if (!canMove(state.piles, move, bakersDozRuleset)) return state;

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
            if (canMove(piles, move, bakersDozRuleset)) {
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

export function isTerminal(state: BakersDozenState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}
