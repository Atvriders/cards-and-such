import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IntelligenceSettings {
  _dummy?: undefined;
}

/** Intelligence: Two-deck solitaire. Build 8 foundations A→K by suit.
 *  18 fans of 3 face-up cards + 14 spare cards.
 *  Top card of each fan/spare is playable to foundations or fans (build down by rank, any suit).
 *  Repack: when a fan is empty, fill from spares. */
export interface IntelligenceState {
  fans: Card[][];
  spares: Card[];
  foundations: { suit: string; cards: Card[] }[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type IntelligenceAction =
  | { type: "move-to-foundation"; fromType: "fan" | "spare"; fromIdx: number; foundIdx: number }
  | { type: "move-fan-to-fan"; fromFan: number; toFan: number }
  | { type: "fill-empty-fan"; spareIdx: number; fanIdx: number };

function foundationNext(cards: Card[]): number {
  if (cards.length === 0) return 1; // Ace
  const top = cards[cards.length - 1]!;
  return top.rank + 1;
}

export function initialState(seed: number, _settings: IntelligenceSettings): IntelligenceState {
  const rng = mulberry32(seed);
  const d1 = newDeck();
  const d2 = newDeck().map((c) => ({ ...c, id: c.id + "-b" }));
  const deck = shuffle([...d1, ...d2], rng); // 104 cards

  // 18 fans of 3 = 54 cards, 50 spare ... actually: 18*3=54, rest=50 too many spares
  // Standard Intelligence: deal all cards into fans of 3 (34 fans of 3 = 102, + 2 spares) - two decks
  // Simpler: 18 fans of 3, 14 spares (56+14=70)... let's do the standard approach:
  // 104 cards: deal into fans of 3. 104/3 = 34 fans + 2 left over
  const fans: Card[][] = [];
  let idx = 0;
  while (idx + 3 <= deck.length) {
    fans.push(deck.slice(idx, idx + 3));
    idx += 3;
  }
  const spares: Card[] = deck.slice(idx);

  const foundations: IntelligenceState["foundations"] = [];
  for (const suit of SUITS) {
    foundations.push({ suit, cards: [] });
    foundations.push({ suit, cards: [] });
  }

  return { fans, spares, foundations, score: 0, movesMade: 0, won: false };
}

function totalOnFoundations(foundations: IntelligenceState["foundations"]): number {
  return foundations.reduce((s, f) => s + f.cards.length, 0);
}

export function reducer(state: IntelligenceState, action: IntelligenceAction): IntelligenceState {
  if (state.won) return state;

  switch (action.type) {
    case "move-to-foundation": {
      const { fromType, fromIdx, foundIdx } = action;
      let card: Card | undefined;
      let newFans = state.fans.map((f) => [...f]);
      let newSpares = [...state.spares];

      if (fromType === "fan") {
        const fan = newFans[fromIdx];
        if (!fan || fan.length === 0) return state;
        card = fan[fan.length - 1]!;
        newFans[fromIdx] = fan.slice(0, -1);
      } else {
        if (fromIdx >= state.spares.length) return state;
        card = newSpares[fromIdx]!;
        newSpares = [...newSpares.slice(0, fromIdx), ...newSpares.slice(fromIdx + 1)];
      }

      const f = state.foundations[foundIdx];
      if (!f) return state;
      if (f.suit !== card.suit) return state;
      if (card.rank !== foundationNext(f.cards)) return state;

      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card!] } : ff,
      );
      const total = totalOnFoundations(newFoundations);

      return {
        ...state,
        fans: newFans,
        spares: newSpares,
        foundations: newFoundations,
        score: state.score + 5,
        movesMade: state.movesMade + 1,
        won: total === 104,
      };
    }

    case "move-fan-to-fan": {
      const { fromFan, toFan } = action;
      if (fromFan === toFan) return state;
      const from = state.fans[fromFan];
      const to = state.fans[toFan];
      if (!from || from.length === 0) return state;
      if (!to || to.length === 0) return state; // empty fans filled via fill-empty-fan
      const card = from[from.length - 1]!;
      const toTop = to[to.length - 1]!;
      // Build down by rank (any suit)
      if (card.rank !== toTop.rank - 1) return state;

      const newFans = state.fans.map((f, i) => {
        if (i === fromFan) return f.slice(0, -1);
        if (i === toFan) return [...f, card];
        return [...f];
      });
      return { ...state, fans: newFans, movesMade: state.movesMade + 1 };
    }

    case "fill-empty-fan": {
      const { spareIdx, fanIdx } = action;
      const fan = state.fans[fanIdx];
      if (!fan || fan.length > 0) return state; // only fill empty fans
      if (spareIdx >= state.spares.length) return state;
      const card = state.spares[spareIdx]!;
      const newSpares = [...state.spares.slice(0, spareIdx), ...state.spares.slice(spareIdx + 1)];
      const newFans = state.fans.map((f, i) => i === fanIdx ? [card] : [...f]);
      return { ...state, fans: newFans, spares: newSpares, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: IntelligenceState): { score: number } | null {
  const total = totalOnFoundations(state.foundations);
  if (total !== 104) return null;
  return { score: state.score };
}
