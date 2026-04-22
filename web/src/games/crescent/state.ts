import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { Card } from "../../engines/deck/index.js";

export interface CrescentSettings {
  _dummy?: undefined;
}

export interface CrescentState {
  piles: Pile[];
  score: number;
  movesMade: number;
  redealsLeft: number;
  won: boolean;
  settings: CrescentSettings;
}

export type CrescentAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "redeal" }
  | { type: "auto-move-to-foundation" };

// 16 crescent piles + 8 foundations (4 ace-up + 4 king-down)
const CRESCENT_IDS = Array.from({ length: 16 }, (_, i) => `cr${i + 1}`);
const ACE_FOUNDATION_IDS = ["fa1", "fa2", "fa3", "fa4"] as const;
const KING_FOUNDATION_IDS = ["fk1", "fk2", "fk3", "fk4"] as const;
const FOUNDATION_IDS = [...ACE_FOUNDATION_IDS, ...KING_FOUNDATION_IDS] as const;

// Crescent foundation rules:
// Ace foundations: build up A→K same suit
// King foundations: build down K→A same suit
function crescentFoundationStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;

  if (target.id.startsWith("fa")) {
    // Ace foundation: build up from Ace
    if (target.cards.length === 0) return c.rank === 1;
    const top = target.cards[target.cards.length - 1]!;
    return top.suit === c.suit && rankVal(c) === rankVal(top) + 1;
  } else {
    // King foundation: build down from King
    if (target.cards.length === 0) return c.rank === 13;
    const top = target.cards[target.cards.length - 1]!;
    return top.suit === c.suit && rankVal(top) === rankVal(c) + 1;
  }
}

export const crescentRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return crescentFoundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Crescent tableau: build down alt-color
    const topRed = top.suit === "♥" || top.suit === "♦";
    const botRed = bottom.suit === "♥" || bottom.suit === "♦";
    return topRed !== botRed && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
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

export function initialState(seed: number, settings: CrescentSettings): CrescentState {
  const rng = mulberry32(seed);
  const fullDeck = shuffle(newDeck(2), rng); // 104 cards

  // Pull out 4 Aces (one per suit) and 4 Kings (one per suit) for foundations
  const aceFoundationCards: Card[] = [];
  const kingFoundationCards: Card[] = [];
  const remainingDeck: Card[] = [];

  const aceSuits = new Set<string>();
  const kingSuits = new Set<string>();

  for (const card of fullDeck) {
    if (card.rank === 1 && aceSuits.size < 4 && !aceSuits.has(card.suit)) {
      aceSuits.add(card.suit);
      aceFoundationCards.push(card);
    } else if (card.rank === 13 && kingSuits.size < 4 && !kingSuits.has(card.suit)) {
      kingSuits.add(card.suit);
      kingFoundationCards.push(card);
    } else {
      remainingDeck.push(card);
    }
  }

  // 96 remaining cards go to 16 crescent piles, 6 each
  const piles: Pile[] = [];
  let idx = 0;
  for (let i = 0; i < 16; i++) {
    const cards = remainingDeck.slice(idx, idx + 6);
    idx += 6;
    piles.push({ id: CRESCENT_IDS[i]!, kind: "tableau", cards, faceUpCount: 6 });
  }

  // Ace foundations (4), each starts with 1 Ace
  for (let i = 0; i < 4; i++) {
    piles.push({ id: ACE_FOUNDATION_IDS[i]!, kind: "foundation", cards: [aceFoundationCards[i]!] });
  }

  // King foundations (4), each starts with 1 King
  for (let i = 0; i < 4; i++) {
    piles.push({ id: KING_FOUNDATION_IDS[i]!, kind: "foundation", cards: [kingFoundationCards[i]!] });
  }

  return { piles, score: 0, movesMade: 0, redealsLeft: 3, won: false, settings };
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

export function reducer(state: CrescentState, action: CrescentAction): CrescentState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, crescentRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const toP = getPile(state.piles, toPile);
      const total = totalOnFoundations(newPiles);
      const won = total === 104;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP?.kind === "foundation" ? 5 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "redeal": {
      if (state.redealsLeft <= 0) return state;

      // Shuffle bottom cards of each crescent pile to top (classic crescent redeal)
      const newPiles = state.piles.map((p) => {
        if (!CRESCENT_IDS.includes(p.id)) return { ...p, cards: [...p.cards] };
        if (p.cards.length <= 1) return { ...p, cards: [...p.cards] };
        // Move bottom card to top
        const cards = [...p.cards];
        const bottom = cards.shift()!;
        cards.push(bottom);
        return { ...p, cards, faceUpCount: p.cards.length };
      });

      return {
        ...state,
        piles: newPiles,
        redealsLeft: state.redealsLeft - 1,
        movesMade: state.movesMade + 1,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;

      while (moved) {
        moved = false;
        for (const sourceId of CRESCENT_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, crescentRuleset)) {
              piles = applyMove(piles, move);
              scoreDelta += 5;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      const won = total === 104;

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

export function isTerminal(state: CrescentState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
