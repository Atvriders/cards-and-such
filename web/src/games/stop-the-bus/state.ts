import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface StopTheBusSettings { dummy: "off" }

export type StopTheBusPhase = "drawing" | "lastRound" | "done";

export interface StopTheBusState {
  settings: StopTheBusSettings;
  hands: readonly (readonly Card[])[];
  pool: readonly Card[]; // 3 face-up cards in the middle
  deck: readonly Card[];
  turn: number;
  round: number;
  knocker: number | null; // who called "stop the bus"
  phase: StopTheBusPhase;
  scores: readonly number[];
  rngSeed: number;
}

export type StopTheBusAction =
  | { type: "swap"; handIdx: number; poolIdx: number }
  | { type: "swapAll" }
  | { type: "stopTheBus" }
  | { type: "pass" };

// Score a 3-card hand: best possible with same suit (add face values)
// Face = 10, A = 11; if all 3 same rank = 30.5
export function scoreHand(hand: readonly Card[]): number {
  if (hand.length !== 3) return 0;

  // Check three of a kind (any suits)
  if (hand[0]!.rank === hand[1]!.rank && hand[1]!.rank === hand[2]!.rank) return 30.5;

  function cardVal(c: Card): number {
    if (c.rank === 1) return 11;
    if (c.rank >= 10) return 10;
    return c.rank;
  }

  // Best same-suit combo
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  let best = 0;
  for (const suit of suits) {
    const matching = hand.filter(c => c.suit === suit);
    const sum = matching.reduce((a, c) => a + cardVal(c), 0);
    if (sum > best) best = sum;
  }
  return best;
}

function botSwap(hand: readonly Card[], pool: readonly Card[]): [number, number] | null {
  let bestScore = scoreHand(hand);
  let bestPair: [number, number] | null = null;

  for (let hi = 0; hi < 3; hi++) {
    for (let pi = 0; pi < 3; pi++) {
      const newHand = [...hand];
      const newPool = [...pool];
      const tmp = newHand[hi]!;
      newHand[hi] = newPool[pi]!;
      newPool[pi] = tmp;
      const s = scoreHand(newHand);
      if (s > bestScore) { bestScore = s; bestPair = [hi, pi]; }
    }
  }
  return bestPair;
}

function runBotsOneTurn(state: StopTheBusState): StopTheBusState {
  const seat = state.turn;
  const hand = state.hands[seat]!;
  const swap = botSwap(hand, state.pool);

  if (swap) {
    const [hi, pi] = swap;
    const newHand = [...hand];
    const newPool = [...state.pool];
    const tmp = newHand[hi]!;
    newHand[hi] = newPool[pi]!;
    newPool[pi] = tmp;
    const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
    const next = (seat + 1) % 4;
    return { ...state, hands: newHands, pool: newPool, turn: next, round: state.round + 1 };
  }

  // Bot stops the bus or passes
  if (scoreHand(hand) >= 28) {
    // Stop the bus
    return { ...state, knocker: seat, phase: "lastRound", turn: (seat + 1) % 4 };
  }

  const next = (seat + 1) % 4;
  return { ...state, turn: next, round: state.round + 1 };
}

function finalizeGame(state: StopTheBusState): StopTheBusState {
  const scores = state.hands.map(h => scoreHand(h));
  const knockerScore = scores[state.knocker!] ?? 0;
  // Knocker loses if they don't have the highest score
  const otherScores = scores.filter((_, i) => i !== state.knocker);
  const knockerWins = otherScores.every(s => s <= knockerScore);
  const finalScores = scores.map((s, i) => {
    if (i === state.knocker) return knockerWins ? 100 : 0;
    // Others score based on hand value relative to max 31
    return Math.round((s / 31) * 80);
  });
  return { ...state, phase: "done", scores: finalScores };
}

export function initialState(seed: number, settings: StopTheBusSettings): StopTheBusState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: Card[][] = [[], [], [], []];
  for (let p = 0; p < 4; p++) for (let i = 0; i < 3; i++) hands[p]!.push(deck[p * 3 + i]!);

  const pool = deck.slice(12, 15);
  const remaining = deck.slice(15);

  return {
    settings, hands: hands as unknown as Card[][], pool, deck: remaining,
    turn: 0, round: 0, knocker: null, phase: "drawing",
    scores: [0, 0, 0, 0], rngSeed: nextSeed,
  };
}

export function reducer(state: StopTheBusState, action: StopTheBusAction): StopTheBusState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: StopTheBusState = { ...state, rngSeed: nextSeed };

  if (action.type === "stopTheBus") {
    s = { ...s, knocker: 0, phase: "lastRound", turn: 1 };
    // Run remaining bots for last round
    let safety = 0;
    while (s.phase === "lastRound" && s.turn !== 0 && safety < 20) {
      safety++;
      s = runBotsOneTurn(s);
    }
    return finalizeGame(s);
  }

  if (action.type === "pass") {
    s = { ...s, turn: 1, round: s.round + 1 };
    let safety = 0;
    while (s.phase === "drawing" && s.turn !== 0 && safety < 20) {
      safety++;
      s = runBotsOneTurn(s);
    }
    return s;
  }

  if (action.type === "swap") {
    const { handIdx, poolIdx } = action;
    if (handIdx < 0 || handIdx > 2 || poolIdx < 0 || poolIdx > 2) return state;
    const hand = [...s.hands[0]!];
    const pool = [...s.pool];
    const tmp = hand[handIdx]!;
    hand[handIdx] = pool[poolIdx]!;
    pool[poolIdx] = tmp;
    const newHands = s.hands.map((h, i) => i === 0 ? hand : h);
    s = { ...s, hands: newHands, pool, turn: 1, round: s.round + 1 };
    let safety = 0;
    while (s.phase === "drawing" && s.turn !== 0 && safety < 20) {
      safety++;
      s = runBotsOneTurn(s);
    }
    return s;
  }

  if (action.type === "swapAll") {
    const hand = [...s.pool];
    const pool = [...s.hands[0]!];
    const newHands = s.hands.map((h, i) => i === 0 ? hand : h);
    s = { ...s, hands: newHands, pool, turn: 1, round: s.round + 1 };
    let safety = 0;
    while (s.phase === "drawing" && s.turn !== 0 && safety < 20) {
      safety++;
      s = runBotsOneTurn(s);
    }
    return s;
  }

  return state;
}

export function isTerminal(state: StopTheBusState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.scores[0] ?? 0 };
}
