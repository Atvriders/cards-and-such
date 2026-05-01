import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, rankVal } from "../../engines/tableau/moves.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DoubleKlondikeSettings {
  _dummy?: undefined;
}

export interface DoubleKlondikeState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: DoubleKlondikeSettings;
}

export type DoubleKlondikeAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"] as const;

/** Two-deck foundation: same suit, ascending Ace→King. Each foundation holds one 13-card run. */
function dkFoundationStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;
  if (target.cards.length === 0) return c.rank === 1;
  if (target.cards.length >= 13) return false;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === c.suit && rankVal(c) === rankVal(top) + 1;
}

export const doubleKlondikeRuleset: Ruleset = {
  canStack: (target, moving) =>
    klondikeTableauStack(target, moving) || dkFoundationStack(target, moving),
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number, settings: DoubleKlondikeSettings): DoubleKlondikeState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(2), rng); // 104 cards
  const piles: Pile[] = [];

  // 9 tableau columns, 1..9 cards (sum 45), top face-up
  let idx = 0;
  for (let i = 0; i < 9; i++) {
    const count = i + 1;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards: deck.slice(idx, idx + count), faceUpCount: 1 });
    idx += count;
  }
  // Stock: remaining 59 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
  for (const id of FOUNDATION_IDS) piles.push({ id, kind: "foundation", cards: [] });

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

export function reducer(state: DoubleKlondikeState, action: DoubleKlondikeAction): DoubleKlondikeState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      const card = ns.cards.pop()!;
      nw.cards.push(card);
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length > 0 || waste.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      ns.cards = [...nw.cards].reverse();
      nw.cards = [];
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, doubleKlondikeRuleset)) return state;
      const fromP = getPile(state.piles, fromPile);
      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      let scoreDelta = 0;
      if (toP?.kind === "foundation") scoreDelta += 10;
      else if (fromP?.kind === "waste" && toP?.kind === "tableau") scoreDelta += 5;
      const total = totalOnFoundations(newPiles);
      return { ...state, piles: newPiles, score: state.score + scoreDelta, movesMade: state.movesMade + 1, won: total === 104 };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        for (const sid of ["waste", ...TABLEAU_IDS]) {
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, doubleKlondikeRuleset)) {
              piles = applyMove(piles, move);
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return { ...state, piles, score, movesMade: state.movesMade + 1, won: totalOnFoundations(piles) === 104 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DoubleKlondikeState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 104) return null;
  return { score: state.score };
}
