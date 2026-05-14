import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { pushHistory, popHistory } from "../../platform/game-plugin/undoHistory.js";

export interface KlondikeSettings {
  drawMode: "1" | "3";
  scoringMode: "standard" | "vegas";
}

export interface KlondikeState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: KlondikeSettings;
  history: KlondikeState[];
}

export type KlondikeAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" }
  | { type: "undo" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const klondikeRuleset: Ruleset = {
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

function makeRuleset(): Ruleset {
  return klondikeRuleset;
}

export function initialState(
  seed: number,
  settings: KlondikeSettings,
): KlondikeState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Build tableau piles (1-indexed)
  let deckIdx = 0;
  for (let i = 0; i < 7; i++) {
    const count = i + 1;
    const cards = deck.slice(deckIdx, deckIdx + count);
    deckIdx += count;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 1, // Only top card face up
    });
  }

  // Stock: remaining cards
  const stockCards = deck.slice(deckIdx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });

  // Waste: empty
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // Foundations: empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  const startScore = settings.scoringMode === "vegas" ? -52 : 0;

  return { piles, score: startScore, movesMade: 0, won: false, settings, history: [] };
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
  state: KlondikeState,
  action: KlondikeAction,
): KlondikeState {
  if (state.won) return state;

  const { settings } = state;
  const ruleset = makeRuleset();

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste) return state;
      if (stock.cards.length === 0) return state;

      const drawCount = settings.drawMode === "3" ? 3 : 1;
      const toDraw = Math.min(drawCount, stock.cards.length);
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;
      const newWaste = newPiles.find((p) => p.id === "waste")!;

      // Draw from top of stock (end of array) to waste
      const drawn = newStock.cards.splice(newStock.cards.length - toDraw, toDraw);
      // drawn[last] was on top of stock — push reversed so last drawn is on top of waste
      for (let i = drawn.length - 1; i >= 0; i--) {
        newWaste.cards.push(drawn[i]!);
      }

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste) return state;
      if (stock.cards.length > 0) return state;
      if (waste.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;
      const newWaste = newPiles.find((p) => p.id === "waste")!;

      newStock.cards = [...newWaste.cards].reverse();
      newWaste.cards = [];

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };

      if (!canMove(state.piles, move, ruleset)) return state;

      const fromP = getPile(state.piles, fromPile);
      const toP = getPile(state.piles, toPile);
      if (!fromP || !toP) return state;

      // Determine score delta
      let scoreDelta = 0;
      if (settings.scoringMode === "standard") {
        if (toP.kind === "foundation") scoreDelta += 10;
        else if (fromP.kind === "waste" && toP.kind === "tableau") scoreDelta += 5;
      } else if (settings.scoringMode === "vegas") {
        if (toP.kind === "foundation") scoreDelta += 5;
      }

      const newPiles = applyMove(state.piles, move);

      // Check if a tableau reveal happened
      if (settings.scoringMode === "standard" && fromP.kind === "tableau") {
        const wasFaceUpCount = fromP.faceUpCount ?? 0;
        const wasTotal = fromP.cards.length;
        const hadFaceDown = wasTotal > wasFaceUpCount;
        const newFromPile = newPiles.find((p) => p.id === fromPile)!;
        const nowFaceUp = newFromPile.faceUpCount ?? 0;
        const nowTotal = newFromPile.cards.length;
        if (hadFaceDown && nowTotal > 0 && nowFaceUp > 0) {
          scoreDelta += 5;
        }
      }

      const newTotal = totalCardsOnFoundations(newPiles);
      const won = newTotal === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
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
        const sourcePileIds = ["waste", ...TABLEAU_IDS];
        for (const sourceId of sourcePileIds) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, ruleset)) {
              piles = applyMove(piles, move);
              if (settings.scoringMode === "standard") scoreDelta += 10;
              else if (settings.scoringMode === "vegas") scoreDelta += 5;
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
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: KlondikeState): { score: number } | null {
  const total = FOUNDATION_IDS.reduce((sum, id) => {
    const p = state.piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
  if (total !== 52) return null;
  return { score: state.score };
}
