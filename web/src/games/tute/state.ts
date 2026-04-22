import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck: A,2,3,4,5,6,7,J(11),Q(12),K(13) — no 8,9,10
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function spanishDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `tu-${s}${r}` });
    }
  }
  return cards;
}

/** Point value in Tute (same as Briscola) */
export function tuteValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;
  if (rank === 3) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0;
}

export type TutePhase = "playing" | "done";

export interface TuteState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  playerPoints: number;
  botPoints: number;
  playerTricks: number;
  botTricks: number;
  phase: TutePhase;
  playerLeads: boolean;
  message: string;
}

export type TuteAction = { type: "play"; cardId: string };

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 10;
  if (rank === 3) return 9;
  if (rank === 13) return 8;
  if (rank === 12) return 7;
  if (rank === 11) return 6;
  return rank;
}

function cardStrength(card: Card, trumpSuit: Suit, ledSuit: Suit): number {
  if (card.suit === trumpSuit) return 2000 + rankOrder(card.rank) * 100 + tuteValue(card.rank);
  if (card.suit === ledSuit) return 1000 + rankOrder(card.rank) * 100 + tuteValue(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

function legalPlays(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trump: Suit): Card[] {
  if (trick.length === 0) return [...hand];
  const led = trick[0]!.card.suit;
  const suitCards = hand.filter(c => c.suit === led);
  if (suitCards.length > 0) return suitCards;
  const trumpCards = hand.filter(c => c.suit === trump);
  if (trumpCards.length > 0) return trumpCards;
  return [...hand];
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trump: Suit): Card {
  const legal = legalPlays(hand, trick, trump);
  if (legal.length === 1) return legal[0]!;

  if (trick.length === 0) {
    // Lead highest value non-trump, or lowest trump
    const nonTrump = legal.filter(c => c.suit !== trump);
    if (nonTrump.length > 0) {
      return nonTrump.reduce((hi, c) => tuteValue(c.rank) > tuteValue(hi.rank) ? c : hi);
    }
    return legal.reduce((lo, c) => tuteValue(c.rank) < tuteValue(lo.rank) ? c : lo);
  }

  const led = trick[0]!.card.suit;
  const currentBest = trick[0]!;
  const currentStr = cardStrength(currentBest.card, trump, led);

  // Try to win cheaply
  const winning = legal.filter(c => cardStrength(c, trump, led) > currentStr);
  if (winning.length > 0) {
    return winning.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  }
  return legal.reduce((lo, c) => tuteValue(c.rank) < tuteValue(lo.rank) ? c : lo);
}

function applyTrick(state: TuteState, trick: readonly { seat: number; card: Card }[]): TuteState {
  const winner = trickWinner(trick, state.trumpSuit);
  const pts = trick.reduce((s, e) => s + tuteValue(e.card.rank), 0);
  const playerPoints = state.playerPoints + (winner === 0 ? pts : 0);
  const botPoints = state.botPoints + (winner === 1 ? pts : 0);
  const playerTricks = state.playerTricks + (winner === 0 ? 1 : 0);
  const botTricks = state.botTricks + (winner === 1 ? 1 : 0);

  const endMsg = () => playerPoints >= 61
    ? `You win! ${playerPoints}-${botPoints} pts`
    : playerPoints === 60 ? `Draw! 60-60`
    : `Bot wins! ${botPoints}-${playerPoints} pts`;

  if (state.playerHand.length === 0 && state.botHand.length === 0) {
    return { ...state, playerPoints, botPoints, playerTricks, botTricks, currentTrick: [], phase: "done", message: endMsg() };
  }

  let s: TuteState = {
    ...state,
    playerPoints,
    botPoints,
    playerTricks,
    botTricks,
    currentTrick: [],
    playerLeads: winner === 0,
    message: winner === 0 ? "You won! Your lead." : "Bot won. Bot leads.",
  };

  // If bot leads, auto-play bot's lead
  if (winner === 1 && s.playerHand.length > 0) {
    const botCard = botPlay(s.botHand, [], s.trumpSuit);
    s = {
      ...s,
      botHand: s.botHand.filter(c => c.id !== botCard.id),
      currentTrick: [{ seat: 1, card: botCard }],
      message: `Bot led ${botCard.suit}${rankLabel(botCard.rank)}. Your turn.`,
    };
  }

  return s;
}

function rankLabel(rank: Card["rank"]): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export { legalPlays };

export function reducer(state: TuteState, action: TuteAction): TuteState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const card = state.playerHand.find(c => c.id === action.cardId);
  if (!card) return state;

  const legal = legalPlays(state.playerHand, state.currentTrick, state.trumpSuit);
  if (!legal.some(c => c.id === card.id)) return state;

  const s = { ...state, rngSeed: nextSeed };
  const newPlayerHand = s.playerHand.filter(c => c.id !== card.id);

  if (s.playerLeads) {
    const trick: { seat: number; card: Card }[] = [{ seat: 0, card }];
    const botCard = botPlay(s.botHand, trick, s.trumpSuit);
    const newBotHand = s.botHand.filter(c => c.id !== botCard.id);
    trick.push({ seat: 1, card: botCard });
    return applyTrick({ ...s, playerHand: newPlayerHand, botHand: newBotHand }, trick);
  } else {
    const trick = [...s.currentTrick, { seat: 0, card }];
    return applyTrick({ ...s, playerHand: newPlayerHand }, trick);
  }
}

export function initialState(seed: number): TuteState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(spanishDeck(), mulberry32(nextSeed));

  // Deal 10 each (no stock for simplicity — single hand)
  const playerHand = deck.slice(0, 10);
  const botHand = deck.slice(10, 20);
  const trumpCard = deck[20]!;

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand,
    botHand,
    trumpSuit: trumpCard.suit,
    currentTrick: [],
    playerPoints: 0,
    botPoints: 0,
    playerTricks: 0,
    botTricks: 0,
    phase: "playing",
    playerLeads: true,
    message: `Trump: ${trumpCard.suit}. You lead!`,
  };
}

export function isTerminal(state: TuteState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.playerPoints - state.botPoints;
  return { score: Math.max(0, Math.min(100, 50 + diff)) };
}
