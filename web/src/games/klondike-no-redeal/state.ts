import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KlondikeNoRedealSettings {
  _dummy?: undefined;
}

export interface KlondikeNoRedealState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: KlondikeNoRedealSettings;
}

export type KlondikeNoRedealAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const klondikeNoRedealRuleset: Ruleset = {
  canStack: (target, moving) =>
    klondikeTableauStack(target, moving, { kingOnly: true }) || foundationStack(target, moving),
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

export function initialState(seed: number, settings: KlondikeNoRedealSettings): KlondikeNoRedealState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  let idx = 0;
  for (let i = 0; i < 7; i++) {
    const count = i + 1;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 1 });
  }

  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

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

export function reducer(state: KlondikeNoRedealState, action: KlondikeNoRedealAction): KlondikeNoRedealState {
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

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, klondikeNoRedealRuleset)) return state;
      const fromP = getPile(state.piles, fromPile);
      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      let scoreDelta = 0;
      if (toP?.kind === "foundation") scoreDelta += 10;
      else if (fromP?.kind === "waste" && toP?.kind === "tableau") scoreDelta += 5;
      if (fromP?.kind === "tableau") {
        const wasFaceUp = fromP.faceUpCount ?? 0;
        const wasTotal = fromP.cards.length;
        const hadFaceDown = wasTotal > wasFaceUp;
        const newFromP = newPiles.find((p) => p.id === fromPile)!;
        if (hadFaceDown && newFromP.cards.length > 0 && (newFromP.faceUpCount ?? 0) > 0) {
          scoreDelta += 5;
        }
      }
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        const sources = ["waste", ...TABLEAU_IDS];
        for (const sid of sources) {
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, klondikeNoRedealRuleset)) {
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
      return {
        ...state,
        piles,
        score,
        movesMade: state.movesMade + 1,
        won: totalOnFoundations(piles) === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: KlondikeNoRedealState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}
