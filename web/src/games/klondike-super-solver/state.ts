import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KlondikeSuperSolverSettings {
  _dummy?: undefined;
}

export interface KlondikeSuperSolverState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  redealsUsed: number;
  hint: string | null;
  settings: KlondikeSuperSolverSettings;
}

export type KlondikeSuperSolverAction =
  | { type: "draw" }
  | { type: "redeal" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" }
  | { type: "hint" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const superSolverRuleset: Ruleset = {
  canStack: (target, moving) =>
    klondikeTableauStack(target, moving) || foundationStack(target, moving),
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

export function initialState(seed: number, settings: KlondikeSuperSolverSettings): KlondikeSuperSolverState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let deckIdx = 0;
  for (let i = 0; i < 7; i++) {
    const count = i + 1;
    const cards = deck.slice(deckIdx, deckIdx + count);
    deckIdx += count;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 1 });
  }
  const stockCards = deck.slice(deckIdx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, redealsUsed: 0, hint: null, settings };
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

function autoMoveToFoundation(piles: Pile[]): Pile[] {
  let current = piles;
  let moved = true;
  while (moved) {
    moved = false;
    const sourceIds = ["waste", ...TABLEAU_IDS];
    for (const sourceId of sourceIds) {
      const src = getPile(current, sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        const mv = { fromPile: sourceId, toPile: foundId, count: 1 };
        if (canMove(current, mv, superSolverRuleset)) {
          current = applyMove(current, mv);
          moved = true;
          break;
        }
      }
      if (moved) break;
    }
  }
  return current;
}

function generateHint(piles: Pile[]): string {
  // Try foundation moves first
  const sourceIds = ["waste", ...TABLEAU_IDS];
  for (const sourceId of sourceIds) {
    const src = getPile(piles, sourceId);
    if (!src || src.cards.length === 0) continue;
    for (const foundId of FOUNDATION_IDS) {
      if (canMove(piles, { fromPile: sourceId, toPile: foundId, count: 1 }, superSolverRuleset)) {
        const card = src.cards[src.cards.length - 1]!;
        return `Move ${card.rank} of ${card.suit} from ${sourceId} → foundation ${foundId}`;
      }
    }
  }
  // Try tableau moves
  for (const sourceId of TABLEAU_IDS) {
    const src = getPile(piles, sourceId);
    if (!src || src.cards.length === 0) continue;
    const faceUp = src.faceUpCount ?? 0;
    for (let count = faceUp; count >= 1; count--) {
      for (const targetId of TABLEAU_IDS) {
        if (targetId === sourceId) continue;
        if (canMove(piles, { fromPile: sourceId, toPile: targetId, count }, superSolverRuleset)) {
          const card = src.cards[src.cards.length - count]!;
          return `Move ${count} card(s) from ${sourceId} (top: ${card.rank}${card.suit}) → ${targetId}`;
        }
      }
    }
  }
  // Try waste to tableau
  const waste = getPile(piles, "waste");
  if (waste && waste.cards.length > 0) {
    for (const targetId of TABLEAU_IDS) {
      if (canMove(piles, { fromPile: "waste", toPile: targetId, count: 1 }, superSolverRuleset)) {
        const card = waste.cards[waste.cards.length - 1]!;
        return `Move ${card.rank}${card.suit} from waste → ${targetId}`;
      }
    }
  }
  const stock = getPile(piles, "stock");
  if (stock && stock.cards.length > 0) return "Draw from stock";
  return "No hint available — try redeal (unlimited!)";
}

export function reducer(state: KlondikeSuperSolverState, action: KlondikeSuperSolverAction): KlondikeSuperSolverState {
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

      const afterAuto = autoMoveToFoundation(newPiles);
      const total = totalOnFoundations(afterAuto);
      return { ...state, piles: afterAuto, movesMade: state.movesMade + 1, won: total === 52, hint: null };
    }

    case "redeal": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length > 0 || waste.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      ns.cards = [...nw.cards].reverse();
      nw.cards = [];

      return { ...state, piles: newPiles, redealsUsed: state.redealsUsed + 1, movesMade: state.movesMade + 1, hint: null };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const mv = { fromPile, toPile, count };
      if (!canMove(state.piles, mv, superSolverRuleset)) return state;

      const toP = getPile(state.piles, toPile);
      const fromP = getPile(state.piles, fromPile);
      if (!toP || !fromP) return state;

      let scoreDelta = 0;
      if (toP.kind === "foundation") scoreDelta += 10;
      else if (fromP.kind === "waste" && toP.kind === "tableau") scoreDelta += 5;

      const movedPiles = applyMove(state.piles, mv);

      if (fromP.kind === "tableau") {
        const wasFU = fromP.faceUpCount ?? 0;
        const wasLen = fromP.cards.length;
        const hadFD = wasLen > wasFU;
        const newFP = movedPiles.find((p) => p.id === fromPile)!;
        if (hadFD && newFP.cards.length > 0 && (newFP.faceUpCount ?? 0) > 0) scoreDelta += 5;
      }

      const afterAuto = autoMoveToFoundation(movedPiles);
      const total = totalOnFoundations(afterAuto);

      return {
        ...state,
        piles: afterAuto,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won: total === 52,
        hint: null,
      };
    }

    case "auto-move-to-foundation": {
      const afterAuto = autoMoveToFoundation(state.piles);
      if (afterAuto === state.piles) return state;
      const total = totalOnFoundations(afterAuto);
      return { ...state, piles: afterAuto, movesMade: state.movesMade + 1, won: total === 52, hint: null };
    }

    case "hint": {
      const hint = generateHint(state.piles);
      return { ...state, hint };
    }

    default:
      return state;
  }
}

export function isTerminal(state: KlondikeSuperSolverState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
