// Boston Whist – historical 4-player bidding card game (popular in 18th-century America/France)
// Player bids number of tricks to take solo against 3 bots
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BostonSettings {
  botDifficulty: "easy" | "hard";
}

export type BostonPhase = "bidding" | "playing" | "done";

export interface BostonState {
  settings: BostonSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: BostonPhase;
  bid: number | null;       // tricks player commits to winning (1–13)
  tricks: readonly number[];
  score: readonly [number, number]; // [player, bots]
  message: string;
}

export type BostonAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14;
  return rank;
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

export function legalPlays(state: BostonState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  const led = trick[0]!.card.suit;
  const matching = hand.filter(c => c.suit === led);
  return matching.length > 0 ? matching : hand;
}

function botPlay(state: BostonState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;
  const led = trick.length > 0 ? trick[0]!.card.suit : trump;

  if (trick.length === 0) {
    return legal.reduce((hi, c) => cardStrength(c, trump, trump) > cardStrength(hi, trump, trump) ? c : hi);
  }

  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
}

function applyPlay(state: BostonState, seat: number, card: Card): BostonState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: BostonState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const playerTricks = newTricks[0]!;
      const bid = state.bid ?? 1;
      const playerWins = playerTricks >= bid;
      const newScore: [number, number] = [state.score[0] + (playerWins ? bid : 0), state.score[1] + (playerWins ? 0 : bid)];
      s = {
        ...s,
        score: newScore,
        phase: "done",
        message: playerWins
          ? `Boston made! You bid ${bid}, took ${playerTricks}. +${bid} pts.`
          : `Boston failed. You bid ${bid}, only took ${playerTricks}.`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: BostonState, action: BostonAction): BostonState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "bidding" && action.type === "bid") {
    const amount = Math.max(1, Math.min(13, action.amount));
    return {
      ...state,
      rngSeed: nextSeed,
      bid: amount,
      phase: "playing",
      turn: 0,
      message: `You bid ${amount} tricks. Trump: ${state.trumpSuit}. You lead!`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: BostonState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }

  return state;
}

export function initialState(seed: number, settings: BostonSettings): BostonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];
  // Flip a card to determine trump
  const trumpSuit = deck[51]!.suit;
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    bid: null,
    tricks: [0, 0, 0, 0],
    score: [0, 0],
    message: `Trump: ${trumpSuit}. How many tricks do you bid? (1–13)`,
  };
}

export function isTerminal(state: BostonState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 4)) };
}
