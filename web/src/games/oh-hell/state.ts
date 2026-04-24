// Oh Hell – trick-taking game with exact bidding (player + 3 bots, 7-card hand)
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface OhHellSettings {
  botDifficulty: "easy" | "hard";
}

export type OhHellPhase = "bidding" | "playing" | "done";

export interface OhHellState {
  settings: OhHellSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpCard: Card;
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: OhHellPhase;
  bids: readonly (number | null)[];  // bid per seat (null = not yet bid)
  tricks: readonly number[];          // tricks taken per seat
  score: readonly [number, number];   // [player, bots cumulative]
  message: string;
}

export type OhHellAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const HAND_SIZE = 7;

function legalSuits(hand: readonly Card[], ledSuit: Suit): Card[] {
  const matching = hand.filter(c => c.suit === ledSuit);
  return matching.length > 0 ? matching : [...hand];
}

export function legalPlays(state: OhHellState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  return legalSuits(hand, trick[0]!.card.suit);
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14;
  return rank;
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

function botBid(hand: readonly Card[], trump: Suit): number {
  // Estimate: count strong trump + high cards
  let estimate = 0;
  for (const c of hand) {
    if (c.suit === trump && (c.rank === 1 || c.rank >= 10)) estimate++;
    else if (c.rank === 1) estimate++;
  }
  return Math.min(estimate, HAND_SIZE);
}

function botPlay(state: OhHellState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;
  const madeTarget = state.tricks[seat]! >= state.bids[seat]!;

  if (trick.length === 0) {
    if (!madeTarget) {
      // Try to win: lead highest trump or high card
      const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
      if (trumpCards.length > 0) return trumpCards[0]!;
      return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
    }
    // Already made bid, lead lowest
    return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }

  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));

  if (!madeTarget && winCards.length > 0) {
    return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  }
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: OhHellState, seat: number, card: Card): OhHellState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: OhHellState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      // Score: +10 + bid if exact, else -|diff|
      const playerBid = state.bids[0] ?? 0;
      const playerTricks = newTricks[0]!;
      const playerPts = playerTricks === playerBid ? 10 + playerBid : -Math.abs(playerTricks - playerBid);
      let botPts = 0;
      for (let i = 1; i < 4; i++) {
        const bid = state.bids[i] ?? 0;
        const taken = newTricks[i]!;
        botPts += taken === bid ? 10 + bid : -Math.abs(taken - bid);
      }
      const newScore: [number, number] = [state.score[0] + playerPts, state.score[1] + botPts];
      s = {
        ...s,
        score: newScore,
        phase: "done",
        message: `Done! You bid ${playerBid}, took ${playerTricks} → ${playerPts > 0 ? "+" : ""}${playerPts} pts.`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: OhHellState, action: OhHellAction): OhHellState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "bidding" && action.type === "bid") {
    if (state.turn !== 0) return state;
    const amount = Math.max(0, Math.min(HAND_SIZE, action.amount));
    const newBids: (number | null)[] = [...state.bids];
    newBids[0] = amount;
    // Bots bid sequentially
    for (let i = 1; i < 4; i++) {
      newBids[i] = botBid(state.hands[i]!, state.trumpSuit);
    }
    return {
      ...state,
      rngSeed: nextSeed,
      bids: newBids,
      phase: "playing",
      turn: state.leadSeat,
      message: `Bids: You=${amount}, B1=${newBids[1]}, B2=${newBids[2]}, B3=${newBids[3]}. Trump: ${state.trumpSuit}`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: OhHellState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: OhHellSettings): OhHellState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, HAND_SIZE),
    deck.slice(HAND_SIZE, HAND_SIZE * 2),
    deck.slice(HAND_SIZE * 2, HAND_SIZE * 3),
    deck.slice(HAND_SIZE * 3, HAND_SIZE * 4),
  ];
  const trumpCard = deck[HAND_SIZE * 4]!;
  const trumpSuit = trumpCard.suit;
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpCard,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    bids: [null, null, null, null],
    tricks: [0, 0, 0, 0],
    score: [0, 0],
    message: `Trump is ${trumpSuit}. How many tricks will you take (0–${HAND_SIZE})?`,
  };
}

export function isTerminal(state: OhHellState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 2)) };
}
