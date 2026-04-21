import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Suit };

export interface CrazyEightsSettings {
  opponents: "1" | "2" | "3";
  forcePlayAfterDraw: boolean;
}

export interface CrazyEightsState {
  settings: CrazyEightsSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardTop: Card;
  activeSuit: Suit;
  turn: number;
  pendingDraw: boolean;
  rngSeed: number;
  winner: number | null;
  finalPenalties: readonly number[] | null;
}

export type CrazyEightsAction =
  | { type: "play"; cardId: string; chosenSuit?: Suit }
  | { type: "draw" }
  | { type: "pass" };

// ── helpers ─────────────────────────────────────────────────────────────────

export function cardPenalty(c: Card): number {
  if (c.rank === 8) return 50;
  if (c.rank >= 11) return 10;
  if (c.rank === 1) return 1;
  return c.rank;
}

function isPlayable(card: Card, top: Card, activeSuit: Suit): boolean {
  if (card.rank === 8) return true;
  return card.suit === activeSuit || card.rank === top.rank;
}

function computePenalties(hands: readonly (readonly Card[])[]): readonly number[] {
  return hands.map((h) => h.reduce((sum, c) => sum + cardPenalty(c), 0));
}

function reshuffle(
  stock: readonly Card[],
  discardTop: Card,
  rngSeed: number,
): { stock: readonly Card[]; rngSeed: number } {
  if (stock.length > 0) return { stock, rngSeed };
  // Reshuffle empty stock — we don't track the full discard pile here,
  // so in practice this is a no-op (stock stays empty); callers handle that.
  return { stock: [], rngSeed };
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(
  seed: number,
  s: CrazyEightsSettings,
): CrazyEightsState {
  const seats = Number(s.opponents) + 1;
  const rng = mulberry32(seed);
  let deck = shuffle(newDeck(), rng);

  // Deal 7 cards to each player
  const hands: Card[][] = Array.from({ length: seats }, () => []);
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    for (let p = 0; p < seats; p++) {
      hands[p]!.push(deck[idx++]!);
    }
  }

  // Flip a starting card — not an 8
  while (deck[idx]!.rank === 8) {
    // Swap the 8 somewhere into the remaining stock
    const swapTarget = idx + 1 + Math.floor(rng() * (deck.length - idx - 1));
    const tmp = deck[idx]!;
    deck[idx] = deck[swapTarget]!;
    deck[swapTarget] = tmp;
  }
  const discardTop = deck[idx]!;
  const stockCards = deck.slice(idx + 1);

  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    settings: s,
    seats,
    hands: hands.map((h) => [...h]),
    stock: stockCards,
    discardTop,
    activeSuit: discardTop.suit,
    turn: 0,
    pendingDraw: false,
    rngSeed: nextSeed,
    winner: null,
    finalPenalties: null,
  };
}

// ── bot logic ─────────────────────────────────────────────────────────────────

function botChooseSuit(hand: readonly Card[]): Suit {
  const counts: Record<Suit, number> = { "♠": 0, "♥": 0, "♦": 0, "♣": 0 };
  for (const c of hand) {
    if (c.rank !== 8) counts[c.suit]++;
  }
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  return suits.sort((a, b) => counts[b] - counts[a])[0]!;
}

function botTurn(
  state: CrazyEightsState,
  seat: number,
): CrazyEightsState {
  let current = state;

  // Try to play a non-8 first, then 8s
  const hand = [...current.hands[seat]!];
  const nonEights = hand.filter(
    (c) => c.rank !== 8 && isPlayable(c, current.discardTop, current.activeSuit),
  );
  const eights = hand.filter((c) => c.rank === 8);

  if (nonEights.length > 0) {
    const card = nonEights[0]!;
    return applyPlay(current, seat, card, undefined);
  }
  if (eights.length > 0) {
    const card = eights[0]!;
    const suit = botChooseSuit(hand);
    return applyPlay(current, seat, card, suit);
  }

  // Draw up to 3 times
  let drew = 0;
  while (drew < 3) {
    const drawResult = drawCard(current, seat);
    current = drawResult.state;
    drew++;
    const drawnCard = drawResult.drawn;
    if (drawnCard && isPlayable(drawnCard, current.discardTop, current.activeSuit)) {
      const suit = drawnCard.rank === 8 ? botChooseSuit(current.hands[seat]!) : undefined;
      return applyPlay(current, seat, drawnCard, suit);
    }
    if (current.stock.length === 0) break;
  }

  // Pass
  return advanceTurn(current);
}

// ── shared mutations ──────────────────────────────────────────────────────────

interface DrawResult {
  state: CrazyEightsState;
  drawn: Card | null;
}

function drawCard(state: CrazyEightsState, seat: number): DrawResult {
  let stock = [...state.stock];

  if (stock.length === 0) {
    // Nothing to draw
    return { state, drawn: null };
  }

  const drawn = stock[0]!;
  stock = stock.slice(1);
  const newHands = state.hands.map((h, i) =>
    i === seat ? [...h, drawn] : [...h],
  );

  return {
    state: { ...state, stock, hands: newHands },
    drawn,
  };
}

function advanceTurn(state: CrazyEightsState): CrazyEightsState {
  const nextTurn = (state.turn + 1) % state.seats;
  return { ...state, turn: nextTurn, pendingDraw: false };
}

function applyPlay(
  state: CrazyEightsState,
  seat: number,
  card: Card,
  chosenSuit: Suit | undefined,
): CrazyEightsState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter((c) => c.id !== card.id) : [...h],
  );
  const activeSuit = card.rank === 8 ? (chosenSuit ?? card.suit) : card.suit;
  const nextState: CrazyEightsState = {
    ...state,
    hands: newHands,
    discardTop: card,
    activeSuit,
    pendingDraw: false,
  };

  if (newHands[seat]!.length === 0) {
    const finalPenalties = computePenalties(newHands);
    return { ...nextState, winner: seat, finalPenalties };
  }

  return advanceTurn(nextState);
}

function runBots(state: CrazyEightsState): CrazyEightsState {
  let current = state;
  while (current.winner === null && current.turn !== 0) {
    const seat = current.turn;
    current = botTurn(current, seat);
  }
  return current;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(
  state: CrazyEightsState,
  action: CrazyEightsAction,
): CrazyEightsState {
  if (state.winner !== null) return state;

  if (action.type === "play") {
    if (state.turn !== 0) return state;

    const hand = state.hands[0]!;
    const card = hand.find((c) => c.id === action.cardId);
    if (!card) return state;

    if (!isPlayable(card, state.discardTop, state.activeSuit)) return state;

    if (card.rank === 8 && !action.chosenSuit) return state;

    const afterPlay = applyPlay(state, 0, card, action.chosenSuit);
    if (afterPlay.winner !== null) return afterPlay;
    return runBots(afterPlay);
  }

  if (action.type === "draw") {
    if (state.turn !== 0 || state.pendingDraw) return state;

    let stock = [...state.stock];
    if (stock.length === 0) {
      // Force-pass if stock is empty
      return runBots(advanceTurn({ ...state, pendingDraw: false }));
    }

    const drawn = stock[0]!;
    stock = stock.slice(1);
    const newHands = state.hands.map((h, i) =>
      i === 0 ? [...h, drawn] : [...h],
    );
    const afterDraw: CrazyEightsState = { ...state, stock, hands: newHands, pendingDraw: true };

    if (
      state.settings.forcePlayAfterDraw &&
      isPlayable(drawn, state.discardTop, state.activeSuit)
    ) {
      const suit = drawn.rank === 8 ? undefined : undefined; // human must pick suit for 8
      if (drawn.rank === 8) {
        // Can't auto-play an 8 (need suit choice) — just keep pendingDraw
        return afterDraw;
      }
      const afterPlay = applyPlay(afterDraw, 0, drawn, undefined);
      if (afterPlay.winner !== null) return afterPlay;
      return runBots(afterPlay);
    }

    // Check if there are any legal cards in hand
    const hasLegal = afterDraw.hands[0]!.some((c) =>
      isPlayable(c, afterDraw.discardTop, afterDraw.activeSuit),
    );
    if (!hasLegal) {
      // Auto-pass
      return runBots(advanceTurn({ ...afterDraw, pendingDraw: false }));
    }

    return afterDraw;
  }

  if (action.type === "pass") {
    if (state.turn !== 0 || !state.pendingDraw) return state;

    // Only valid if no legal cards
    const hasLegal = state.hands[0]!.some((c) =>
      isPlayable(c, state.discardTop, state.activeSuit),
    );
    if (hasLegal) return state;

    return runBots(advanceTurn({ ...state, pendingDraw: false }));
  }

  return state;
}

// ── terminal ──────────────────────────────────────────────────────────────────

export function isTerminal(state: CrazyEightsState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 200 };
  const myPenalty = state.finalPenalties?.[0] ?? 0;
  return { score: Math.max(0, 200 - myPenalty) };
}
