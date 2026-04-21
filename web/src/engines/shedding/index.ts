import type { HandState, ShedCard } from "./types.js";
export type { HandState, ShedCard } from "./types.js";

export function dealHands<C extends ShedCard>(
  deck: C[],
  seats: number,
  perPlayer: number,
): { hands: C[][]; remaining: C[] } {
  const hands: C[][] = Array.from({ length: seats }, () => []);
  let idx = 0;
  for (let r = 0; r < perPlayer; r++) {
    for (let s = 0; s < seats; s++) {
      const card = deck[idx++];
      if (card) hands[s]!.push(card);
    }
  }
  return { hands, remaining: deck.slice(idx) };
}

export function drawFromPile<C extends ShedCard>(state: HandState<C>, seat: number, count = 1): HandState<C> {
  const drawn = state.drawPile.slice(0, count);
  const rest = state.drawPile.slice(count);
  const hands = state.hands.map((h, i) => (i === seat ? [...h, ...drawn] : h));
  return { ...state, hands, drawPile: rest };
}

export function playCard<C extends ShedCard>(state: HandState<C>, seat: number, cardId: string): HandState<C> {
  const hand = state.hands[seat];
  if (!hand) return state;
  const idx = hand.findIndex((c) => c.id === cardId);
  if (idx < 0) return state;
  const card = hand[idx]!;
  const newHand = hand.slice(0, idx).concat(hand.slice(idx + 1));
  const hands = state.hands.map((h, i) => (i === seat ? newHand : h));
  return {
    ...state,
    hands,
    discardPile: [...state.discardPile, card],
  };
}

export function advanceTurn<C extends ShedCard>(state: HandState<C>, skip = 0): HandState<C> {
  // skip=0 → next player; skip=1 → skip one player (draw-2/skip effect); negative wraps
  const step = (1 + skip) * state.direction;
  let next = state.turn + step;
  next = ((next % state.seats) + state.seats) % state.seats;
  return { ...state, turn: next };
}

export function reverseDirection<C extends ShedCard>(state: HandState<C>): HandState<C> {
  return { ...state, direction: (state.direction === 1 ? -1 : 1) as 1 | -1 };
}

export function top<C extends ShedCard>(state: HandState<C>): C | null {
  return state.discardPile[state.discardPile.length - 1] ?? null;
}

/** When draw pile is empty, recycle the discard pile minus its top card. Order is preserved then shuffled externally. */
export function recycleDiscard<C extends ShedCard>(state: HandState<C>): { state: HandState<C>; toShuffle: C[] } {
  if (state.discardPile.length <= 1) return { state, toShuffle: [] };
  const t = state.discardPile[state.discardPile.length - 1]!;
  const rest = state.discardPile.slice(0, -1);
  return {
    state: { ...state, drawPile: [], discardPile: [t] },
    toShuffle: rest,
  };
}
