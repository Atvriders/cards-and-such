import type { Pile } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SultanSettings {
  _dummy?: undefined;
}

export interface SultanState {
  /** Foundations f1–f8: 8 piles. f5 is the Sultan (King of Hearts, immovable).
   *  f1–f4 build K→A→K (wrap) in suit. f6–f8 also build up in suit from K.
   *  Actually simplified: all 8 foundations start with a King and build up in suit wrapping A after K.
   *  Cards go: K (start), A, 2, 3, ..., Q (end = complete).
   */
  piles: Pile[];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: SultanSettings;
}

export type SultanAction =
  | { type: "draw" }
  | { type: "play-waste"; toPile: string }
  | { type: "play-reserve"; fromPile: string; toPile: string }
  | { type: "move-to-foundation"; fromPile: string; toPile: string };

/** Foundation IDs: f1-f8 */
const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"] as const;
/** Reserve (side column) IDs: r1-r4 (left) r5-r8 (right), simplified to r1-r4 */
const RESERVE_IDS = ["r1","r2","r3","r4"] as const;
const SULTAN_ID = "f5"; // King of Hearts — always stays, builds nothing

/**
 * Sultan of Turkey — simplified implementation:
 * - 8 foundations start with a King each (one per suit × 2 decks, but we use 1 deck).
 * - Simplified to 1 deck: 4 foundations start with the 4 Kings (f1=♠K, f2=♥K=Sultan, f3=♦K, f4=♣K).
 *   The Sultan (f2=♥K) stays fixed and is already "complete" in terms of king placement.
 *   The other 3 foundations (f1, f3, f4) build up from K: K→A→2→...→Q.
 *   1 extra foundation slot f5 starts empty and builds A→K for ♥ (to complete the Sultan's suit via a different ace).
 * - Actually: simplest correct form — 4 foundations for 4 suits, each starts with its King.
 *   Build: K(start) → A → 2 → ... → Q (12 cards on top = done).
 *   Sultan (♥K foundation) is locked; cannot move cards away from Sultan.
 * - 4 reserve columns (r1-r4), each holds 1 card (simple tableau slots).
 * - Stock of remaining cards; flip one at a time to waste; play waste to foundation or reserve.
 */

function rankVal(rank: Card["rank"]): number {
  return rank === 1 ? 14 : (rank as number); // Ace high for wrapping
}

/** Next rank in Sultan sequence: K→A→2→3→...→Q */
function sultanNextRank(rank: Card["rank"]): Card["rank"] {
  if (rank === 13) return 1;  // K → A
  if (rank === 12) return null as unknown as Card["rank"]; // Q is terminal
  return (rank as number + 1) as Card["rank"];
}

export function canBuildOnFoundation(foundation: Pile, card: Card): boolean {
  if (foundation.id === SULTAN_ID) return false; // Sultan is fixed
  if (foundation.cards.length === 0) return false; // must start with a King (placed at deal)
  const top = foundation.cards[foundation.cards.length - 1]!;
  if (top.suit !== card.suit) return false;
  const next = sultanNextRank(top.rank);
  if (next === null) return false; // foundation complete
  return card.rank === next;
}

export function initialState(seed: number, settings: SultanSettings): SultanState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Pull the 4 Kings out and place them on foundations f1-f4
  const kings: Card[] = [];
  const remaining: Card[] = [];
  for (const card of deck) {
    if (card.rank === 13 && kings.length < 4) {
      kings.push(card);
    } else {
      remaining.push(card);
    }
  }

  // Assign kings to foundations by suit order they appear
  // Foundation f5 = Sultan = ♥ King
  const kingsOrdered = [...kings.sort((a, b) => {
    const suitOrder: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
    return suitOrder[a.suit]! - suitOrder[b.suit]!;
  })];

  const piles: Pile[] = [];

  // f1-f4: foundations with one king each; f5=Sultan=♥
  let sultanIdx = kingsOrdered.findIndex((k) => k.suit === "♥");
  if (sultanIdx === -1) sultanIdx = 1; // fallback

  // Rearrange so Sultan is at index 4 (f5)
  const sortedKings: Card[] = [];
  let sIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === sultanIdx) continue;
    sortedKings.push(kingsOrdered[i]!);
  }
  // f1, f2, f3 = non-sultan kings; f4 placeholder empty; f5 = Sultan
  for (let i = 1; i <= 4; i++) {
    const king = sortedKings[i - 1];
    piles.push({
      id: `f${i}`,
      kind: "foundation",
      cards: king ? [king] : [],
    });
  }
  // f5 = Sultan (♥ King)
  piles.push({
    id: SULTAN_ID,
    kind: "foundation",
    cards: [kingsOrdered[sultanIdx]!],
  });

  // f6-f8: not used in simplified version (just 5 foundations: f1-f4 + f5 Sultan)
  // We omit f6-f8 for simplicity.

  // Reserve columns r1-r4: deal 4 cards face-up
  const reserve4 = remaining.slice(0, 4);
  const stock = remaining.slice(4);

  for (let i = 0; i < 4; i++) {
    piles.push({
      id: RESERVE_IDS[i]!,
      kind: "tableau",
      cards: reserve4[i] ? [reserve4[i]!] : [],
      faceUpCount: reserve4[i] ? 1 : 0,
    });
  }

  return {
    piles,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
    settings,
  };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  // Win when all 4 non-sultan foundations have 13 cards (K + 12 more) = 13 each = 52 total
  // Sultan never grows. Win = f1-f4 each have 13 cards.
  let total = 0;
  for (const id of ["f1","f2","f3","f4"]) {
    const p = piles.find((pp) => pp.id === id);
    total += p?.cards.length ?? 0;
  }
  return total;
}

export function reducer(state: SultanState, action: SultanAction): SultanState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) {
        // Redeal: flip waste back to stock
        if (state.waste.length === 0) return state;
        return {
          ...state,
          stock: [...state.waste].reverse(),
          waste: [],
          movesMade: state.movesMade + 1,
        };
      }
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return {
        ...state,
        stock: newStock,
        waste: [...state.waste, card],
        movesMade: state.movesMade + 1,
      };
    }

    case "play-waste": {
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const { toPile } = action;
      const pile = getPile(state.piles, toPile);
      if (!pile) return state;

      if (pile.kind === "foundation") {
        if (!canBuildOnFoundation(pile, card)) return state;
        const newPiles = state.piles.map((p) =>
          p.id === toPile ? { ...p, cards: [...p.cards, card] } : p
        );
        const newWaste = state.waste.slice(0, -1);
        const total = totalOnFoundations(newPiles);
        const won = total === 52; // f1-f4 each 13
        return {
          ...state,
          piles: newPiles,
          waste: newWaste,
          score: state.score + 10,
          movesMade: state.movesMade + 1,
          won,
        };
      }

      if (pile.kind === "tableau") {
        // Reserve: only hold 1 card; empty = any card
        if (pile.cards.length > 0) return state;
        const newPiles = state.piles.map((p) =>
          p.id === toPile ? { ...p, cards: [card], faceUpCount: 1 } : p
        );
        const newWaste = state.waste.slice(0, -1);
        return {
          ...state,
          piles: newPiles,
          waste: newWaste,
          movesMade: state.movesMade + 1,
        };
      }

      return state;
    }

    case "play-reserve": {
      const { fromPile, toPile } = action;
      const from = getPile(state.piles, fromPile);
      if (!from || from.kind !== "tableau" || from.cards.length === 0) return state;
      const card = from.cards[from.cards.length - 1]!;
      const to = getPile(state.piles, toPile);
      if (!to || to.kind !== "foundation") return state;
      if (!canBuildOnFoundation(to, card)) return state;

      const newPiles = state.piles.map((p) => {
        if (p.id === fromPile) return { ...p, cards: p.cards.slice(0, -1), faceUpCount: 0 };
        if (p.id === toPile) return { ...p, cards: [...p.cards, card] };
        return p;
      });

      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + 10,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "move-to-foundation": {
      // Convenience: same as play-reserve but generalized source
      const { fromPile, toPile } = action;
      const from = getPile(state.piles, fromPile);
      if (!from || from.cards.length === 0) return state;
      const card = from.cards[from.cards.length - 1]!;
      const to = getPile(state.piles, toPile);
      if (!to || to.kind !== "foundation") return state;
      if (!canBuildOnFoundation(to, card)) return state;

      const newPiles = state.piles.map((p) => {
        if (p.id === fromPile) {
          const newCards = p.cards.slice(0, -1);
          return { ...p, cards: newCards, faceUpCount: Math.max(0, (p.faceUpCount ?? 0) - 1) };
        }
        if (p.id === toPile) return { ...p, cards: [...p.cards, card] };
        return p;
      });

      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + 10,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SultanState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

export { rankVal, SULTAN_ID, FOUNDATION_IDS, RESERVE_IDS };
