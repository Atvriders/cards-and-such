// Tarock (simplified) – trick-taking with tarot-derived hierarchy, 4 players
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TarockSettings {
  botDifficulty: "easy" | "hard";
}

export type TarockPhase = "playing" | "done";

export interface TarockState {
  settings: TarockSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: TarockPhase;
  tricksWon: readonly number[];
  score: readonly [number, number];
  message: string;
}

export type TarockAction = { type: "play"; cardId: string };

const HAND_SIZE = 8;

function rankOrder(rank: Card["rank"]): number {
  return rank === 1 ? 14 : rank;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: TarockState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  if (followers.length > 0) return followers;
  const trumpers = hand.filter(c => c.suit === state.trumpSuit);
  return trumpers.length > 0 ? trumpers : hand;
}

function botPlay(state: TarockState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trump = state.trumpSuit;
  const trick = state.currentTrick;

  if (trick.length === 0) {
    const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
    if (trumpCards.length > 0 && Math.random() > 0.5) return trumpCards[0]!;
    return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: TarockState, seat: number, card: Card): TarockState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: TarockState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksWon = state.tricksWon.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricksWon: newTricksWon, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const playerTricks = newTricksWon[0]!;
      const botTricks = newTricksWon[1]! + newTricksWon[2]! + newTricksWon[3]!;
      const pPts = playerTricks * 2 - botTricks;
      s = {
        ...s,
        score: [state.score[0] + pPts, state.score[1] - pPts],
        phase: "done",
        message: `You took ${playerTricks} tricks. ${pPts > 0 ? "You win!" : "Bots win!"}`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: TarockState, action: TarockAction): TarockState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

  let s: TarockState = { ...state, rngSeed: nextSeed };
  s = applyPlay(s, 0, card);
  while (s.phase === "playing" && s.turn !== 0) {
    const botCard = botPlay(s, s.turn);
    s = applyPlay(s, s.turn, botCard);
  }
  return s;
}

export function initialState(seed: number, settings: TarockSettings): TarockState {
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
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const trumpSuit = suits[Math.floor(dealRng() * suits.length)]!;
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksWon: [0, 0, 0, 0],
    score: [0, 0],
    message: `Trump: ${trumpSuit}. You vs 3 bots — most tricks wins!`,
  };
}

export function isTerminal(state: TarockState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 2)) };
}
