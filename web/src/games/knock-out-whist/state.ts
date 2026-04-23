import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Knock-Out Whist — up to 5 players, decreasing hand sizes each round.
// Each round: deal N cards (N = 8 - roundNumber), play N tricks, lowest scorer(s) eliminated.
// Last player standing wins.

export interface KnockOutWhistSettings {
  opponents: "2" | "3" | "4";
}

export type KOWPhase = "playing" | "between-rounds" | "done";

export interface KnockOutWhistState {
  settings: KnockOutWhistSettings;
  rngSeed: number;
  seats: number;                          // total players including human
  active: readonly boolean[];             // still in game
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: KOWPhase;
  tricksTaken: readonly number[];
  tricksInRound: number;                  // tricks played this round
  cardsPerRound: number;                  // tricks possible in this round
  roundNumber: number;
  finalWinner: number | null;
  message: string;
}

export type KOWAction = { type: "play"; cardId: string } | { type: "next-round" };

// ── helpers ──────────────────────────────────────────────────────────────────

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = ledSuit(trick)!;
  const trumps = trick.filter(e => e.card.suit === trump);
  if (trumps.length > 0) return trumps.reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
  return trick.filter(e => e.card.suit === led).reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
}

export function legalPlays(state: KnockOutWhistState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  return suitCards.length > 0 ? suitCards : [...hand];
}

// ── bot play ─────────────────────────────────────────────────────────────────

function botPlay(state: KnockOutWhistState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;

  if (trick.length === 0) return legal.reduce((hi, c) => c.rank > hi.rank ? c : hi);

  const winner = trickWinner(trick, trump);
  const winnerCard = trick.find(e => e.seat === winner)!.card;
  const winning = winner === seat;
  if (winning) return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);

  const led = ledSuit(trick)!;
  const follow = legal.filter(c => c.suit === led);
  if (follow.length > 0) {
    const above = follow.filter(c => c.rank > winnerCard.rank && winnerCard.suit === led);
    if (above.length > 0) return above.reduce((lo, c) => c.rank < lo.rank ? c : lo);
    return follow.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  const trumpCards = legal.filter(c => c.suit === trump);
  if (trumpCards.length > 0) return trumpCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  return legal.reduce((lo, c) => c.rank < lo.rank ? c : lo);
}

// ── round end logic ───────────────────────────────────────────────────────────

function endRound(s: KnockOutWhistState): KnockOutWhistState {
  const activePlayers = s.active.map((a, i) => a ? i : -1).filter(i => i >= 0);
  if (activePlayers.length <= 1) {
    const winner = activePlayers[0] ?? 0;
    return {
      ...s,
      phase: "done",
      finalWinner: winner,
      message: `${winner === 0 ? "You win" : `Bot ${winner} wins`}! Last player standing.`,
    };
  }

  // Find lowest scorer(s) among active players
  const minTricks = Math.min(...activePlayers.map(i => s.tricksTaken[i]!));
  const losers = activePlayers.filter(i => s.tricksTaken[i] === minTricks);
  const newActive = s.active.map((a, i) => a && !losers.includes(i));
  const stillActive = newActive.filter(Boolean).length;

  if (stillActive <= 1) {
    const winner = newActive.findIndex(Boolean);
    return {
      ...s,
      active: newActive,
      phase: "done",
      finalWinner: winner,
      message: `${winner === 0 ? "You win" : `Bot ${winner} wins`}! Last player standing.`,
    };
  }

  return {
    ...s,
    active: newActive,
    phase: "between-rounds",
    message: `Round ${s.roundNumber} over! ${losers.map(i => i === 0 ? "You" : `Bot ${i}`).join(", ")} eliminated. Click "Next Round".`,
  };
}

function startNextRound(s: KnockOutWhistState, rng: () => number): KnockOutWhistState {
  const roundNumber = s.roundNumber + 1;
  const cardsPerRound = Math.max(1, 8 - roundNumber);
  const deck = shuffle(newDeck(), rng);
  const active = [...s.active];
  let deckIdx = 0;
  const hands: Card[][] = s.hands.map((_, i) => {
    if (!active[i]) return [];
    const hand = deck.slice(deckIdx, deckIdx + cardsPerRound);
    deckIdx += cardsPerRound;
    return hand;
  });
  const trumpCard = deck[deckIdx] ?? deck[0]!;
  const trumpSuit = trumpCard.suit;

  return {
    ...s,
    rngSeed: Math.floor(rng() * 2 ** 31),
    hands,
    trumpSuit,
    currentTrick: [],
    tricksTaken: s.tricksTaken.map(() => 0),
    tricksInRound: 0,
    cardsPerRound,
    leadSeat: 0,
    turn: s.active[0] ? 0 : s.active.findIndex(Boolean),
    phase: "playing",
    roundNumber,
    message: `Round ${roundNumber}: ${cardsPerRound} cards each, trump: ${trumpSuit}`,
  };
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: KnockOutWhistState, seat: number, card: Card): KnockOutWhistState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  const activePlayers = state.active.filter(Boolean).length;
  let s: KnockOutWhistState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === activePlayers) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const tricksInRound = state.tricksInRound + 1;

    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, tricksInRound, leadSeat: winner, turn: winner };

    if (tricksInRound === state.cardsPerRound) {
      s = endRound(s);
    }
  } else {
    // advance turn to next active player
    let next = (seat + 1) % state.seats;
    while (!state.active[next]) next = (next + 1) % state.seats;
    s = { ...s, turn: next };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: KnockOutWhistState, action: KOWAction): KnockOutWhistState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "next-round") {
    if (state.phase !== "between-rounds") return state;
    return startNextRound({ ...state, rngSeed: nextSeed }, botRng);
  }

  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  const legal = legalPlays(state, 0);
  if (!legal.some(c => c.id === card.id)) return state;

  let s: KnockOutWhistState = { ...state, rngSeed: nextSeed };
  s = applyCard(s, 0, card);

  while (s.phase === "playing" && s.turn !== 0) {
    const botCard = botPlay(s, s.turn);
    s = applyCard(s, s.turn, botCard);
  }

  return s;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: KnockOutWhistSettings): KnockOutWhistState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const seats = 1 + Number(settings.opponents);
  const cardsPerRound = 7;
  const deck = shuffle(newDeck(), dealRng);
  let deckIdx = 0;
  const hands: Card[][] = [];
  for (let i = 0; i < seats; i++) {
    hands.push(deck.slice(deckIdx, deckIdx + cardsPerRound));
    deckIdx += cardsPerRound;
  }
  const trumpCard = deck[deckIdx] ?? deck[0]!;
  const trumpSuit: Suit = SUITS[Math.floor(dealRng() * 4)] ?? "♠";
  void trumpCard;

  const active = Array.from({ length: seats }, () => true);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    seats,
    active,
    hands,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: Array.from({ length: seats }, () => 0),
    tricksInRound: 0,
    cardsPerRound,
    roundNumber: 1,
    finalWinner: null,
    message: `Round 1: 7 cards each, trump: ${trumpSuit}`,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: KnockOutWhistState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.finalWinner === 0) return { score: 100 };
  return { score: 0 };
}
