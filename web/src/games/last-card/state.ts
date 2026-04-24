import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LastCardSettings { dummy: "off" }

export type LastCardPhase = "playing" | "done";

export interface LastCardState {
  settings: LastCardSettings;
  hands: readonly (readonly Card[])[];
  deck: readonly Card[];
  discard: readonly Card[];
  turn: number;
  currentSuit: Suit;
  direction: 1 | -1;
  drawPending: number; // stacked draw-2 or draw-4 penalties
  skipPending: boolean;
  calledLastCard: boolean[]; // did player call "Last Card!" when at 1 card
  phase: LastCardPhase;
  rngSeed: number;
}

export type LastCardAction =
  | { type: "play"; cardId: string; suit?: Suit }
  | { type: "draw" }
  | { type: "callLastCard" };

function suitOf(c: Card): Suit { return c.suit; }
function rankOf(c: Card): Rank { return c.rank; }

export function canPlayOn(card: Card, topCard: Card, currentSuit: Suit): boolean {
  if (rankOf(card) === 8) return true; // 8 is wild
  return suitOf(card) === currentSuit || rankOf(card) === rankOf(topCard);
}

function drawFromDeck(deck: readonly Card[], discard: readonly Card[], count: number, rngSeed: number): {
  drawn: Card[]; deck: Card[]; discard: Card[]; rngSeed: number;
} {
  let d = [...deck];
  let dis = [...discard];
  let seed = rngSeed;
  if (d.length < count && dis.length > 1) {
    const rng = mulberry32(seed);
    seed = Math.floor(rng() * 2 ** 31);
    const top = dis[dis.length - 1]!;
    const reshuffled = shuffle(dis.slice(0, -1), rng);
    d = [...d, ...reshuffled];
    dis = [top];
  }
  const drawn = d.splice(0, Math.min(count, d.length));
  return { drawn, deck: d, discard: dis, rngSeed: seed };
}

function nextSeat(state: LastCardState, from: number): number {
  const n = state.hands.length;
  return ((from + state.direction) % n + n) % n;
}

function applyPlayCard(state: LastCardState, seat: number, cardId: string, suitChoice?: Suit): LastCardState | null {
  const hand = state.hands[seat]!;
  const card = hand.find(c => c.id === cardId);
  if (!card) return null;

  const top = state.discard[state.discard.length - 1]!;
  if (!canPlayOn(card, top, state.currentSuit)) return null;

  const newHand = hand.filter(c => c.id !== cardId);
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  const newDiscard = [...state.discard, card];

  let { direction, drawPending, skipPending } = state;
  let currentSuit: Suit = suitOf(card) === suitOf(top) || rankOf(card) === rankOf(top)
    ? suitOf(card) : state.currentSuit;

  if (rankOf(card) === 8) {
    currentSuit = suitChoice ?? suitOf(card);
  }
  if (rankOf(card) === 2) drawPending += 2;
  if (rankOf(card) === 7) skipPending = true; // 7 = skip
  if (rankOf(card) === 1) direction = direction === 1 ? -1 : 1; // Ace = reverse

  if (newHand.length === 0) {
    return { ...state, hands: newHands, discard: newDiscard, currentSuit, direction, drawPending: 0, skipPending: false, phase: "done" };
  }

  let next = nextSeat(state, seat);
  if (skipPending) { next = nextSeat({ ...state, direction }, next); skipPending = false; }

  return { ...state, hands: newHands, discard: newDiscard, currentSuit, direction, drawPending, skipPending, turn: next };
}

function botTurn(state: LastCardState): LastCardState {
  const seat = state.turn;
  const hand = state.hands[seat]!;
  const top = state.discard[state.discard.length - 1]!;

  if (state.drawPending > 0) {
    // Try to stack a 2
    const two = hand.find(c => rankOf(c) === 2);
    if (two) {
      const next = applyPlayCard(state, seat, two.id);
      if (next) return next;
    }
    // Must draw
    const result = drawFromDeck(state.deck, state.discard, state.drawPending, state.rngSeed);
    const newHand = [...hand, ...result.drawn];
    const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
    const next = nextSeat(state, seat);
    return { ...state, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed, drawPending: 0, turn: next };
  }

  // Play lowest valid card (prefer non-special, then special)
  const playable = hand.filter(c => canPlayOn(c, top, state.currentSuit));
  if (playable.length > 0) {
    playable.sort((a, b) => a.rank - b.rank);
    const card = playable[0]!;
    const next = applyPlayCard(state, seat, card.id);
    if (next) return next;
  }

  // Draw one card
  const result = drawFromDeck(state.deck, state.discard, 1, state.rngSeed);
  const newHand = [...hand, ...result.drawn];
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  const next = nextSeat(state, seat);
  return { ...state, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed, turn: next };
}

function runBots(state: LastCardState): LastCardState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 500) {
    safety++;
    s = botTurn(s);
  }
  return s;
}

export function initialState(seed: number, settings: LastCardSettings): LastCardState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < 7; i++) for (let p = 0; p < 4; p++) hands[p]!.push(deck[i * 4 + p]!);

  let remaining = deck.slice(28);
  // Ensure first discard is not an 8
  let startIdx = remaining.findIndex(c => c.rank !== 8);
  if (startIdx < 0) startIdx = 0;
  const firstCard = remaining.splice(startIdx, 1)[0]!;

  return {
    settings, hands: hands as unknown as Card[][], deck: remaining, discard: [firstCard],
    turn: 0, currentSuit: firstCard.suit, direction: 1, drawPending: 0, skipPending: false,
    calledLastCard: [false, false, false, false], phase: "playing", rngSeed: nextSeed,
  };
}

export function reducer(state: LastCardState, action: LastCardAction): LastCardState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: LastCardState = { ...state, rngSeed: nextSeed };

  if (action.type === "callLastCard") {
    const called = [...s.calledLastCard];
    called[0] = true;
    return { ...s, calledLastCard: called };
  }

  if (action.type === "draw") {
    if (s.drawPending > 0) {
      // Check if player can stack a 2
      const hand = s.hands[0]!;
      const two = hand.find(c => rankOf(c) === 2);
      if (!two) {
        // Draw the penalty
        const result = drawFromDeck(s.deck, s.discard, s.drawPending, s.rngSeed);
        const newHand = [...hand, ...result.drawn];
        const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
        const next = nextSeat(s, 0);
        s = { ...s, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed, drawPending: 0, turn: next };
        return runBots(s);
      }
    }
    const hand = s.hands[0]!;
    const result = drawFromDeck(s.deck, s.discard, 1, s.rngSeed);
    const newHand = [...hand, ...result.drawn];
    const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
    const next = nextSeat(s, 0);
    s = { ...s, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed, turn: next };
    return runBots(s);
  }

  if (action.type === "play") {
    const next = applyPlayCard(s, 0, action.cardId, action.suit);
    if (!next) return state;
    s = next;
    if (s.phase === "done") return s;
    return runBots(s);
  }

  return state;
}

export function isTerminal(state: LastCardState): { score: number } | null {
  if (state.phase !== "done") return null;
  const won = state.hands[0]!.length === 0;
  return { score: won ? 100 : 0 };
}
