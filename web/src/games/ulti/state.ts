// Ulti – Hungarian trick-taking game, 3 players, declarer vs 2 defenders
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface UltiSettings {
  botDifficulty: "easy" | "hard";
}

export type UltiPhase = "bidding" | "playing" | "done";

export interface UltiState {
  settings: UltiSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit | null;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: UltiPhase;
  declarer: number;
  bid: number; // 1-10 (number of tricks declared)
  tricks: readonly number[];
  score: readonly [number, number]; // [player, bots]
  message: string;
}

export type UltiAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const HAND_SIZE = 10;

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

export function legalPlays(state: UltiState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  if (followers.length > 0) return followers;
  const trumpers = hand.filter(c => c.suit === state.trumpSuit);
  return trumpers.length > 0 ? trumpers : hand;
}

function botBid(hand: readonly Card[]): number {
  let strong = 0;
  for (const c of hand) {
    if (c.rank === 1 || c.rank >= 12) strong++;
  }
  return Math.max(3, Math.min(7, strong + 2));
}

function botPlay(state: UltiState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trump = state.trumpSuit!;
  const trick = state.currentTrick;

  if (trick.length === 0) {
    if (seat === state.declarer) {
      const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
      if (trumpCards.length > 0) return trumpCards[0]!;
    }
    return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  // Defenders try to set; declarer tries to make
  if (seat === state.declarer && winCards.length > 0) {
    return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  }
  if (seat !== state.declarer && winCards.length > 0) {
    return winCards[0]!;
  }
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: UltiState, seat: number, card: Card): UltiState {
  const trump = state.trumpSuit!;
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: UltiState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 3) {
    const winner = trickWinner(newTrick, trump);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const declarerTricks = newTricks[state.declarer]!;
      const made = declarerTricks >= state.bid;
      const pPts = state.declarer === 0
        ? (made ? state.bid : -state.bid)
        : (made ? -1 : 1);
      s = {
        ...s,
        score: [state.score[0] + pPts, state.score[1] - pPts],
        phase: "done",
        message: `${state.declarer === 0 ? "You" : `Bot ${state.declarer}`} bid ${state.bid}, took ${declarerTricks}. ${made ? "Made!" : "Set!"}`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 3 };
  }
  return s;
}

export function reducer(state: UltiState, action: UltiAction): UltiState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "bidding" && action.type === "bid") {
    if (state.turn !== 0) return state;
    const botBids = [botBid(state.hands[1]!), botBid(state.hands[2]!)];
    const allBids = [action.amount, botBids[0]!, botBids[1]!];
    const maxBid = Math.max(...allBids);
    const declarerIdx = allBids.indexOf(maxBid);

    const declarerHand = state.hands[declarerIdx]!;
    const suitCount = new Map<Suit, number>();
    for (const c of declarerHand) suitCount.set(c.suit, (suitCount.get(c.suit) ?? 0) + 1);
    let trumpSuit: Suit = "♠";
    let maxCount = 0;
    for (const [suit, count] of suitCount) {
      if (count > maxCount) { maxCount = count; trumpSuit = suit; }
    }

    return {
      ...state, rngSeed: nextSeed,
      bid: maxBid, declarer: declarerIdx,
      trumpSuit, phase: "playing",
      turn: declarerIdx, leadSeat: declarerIdx,
      message: `${declarerIdx === 0 ? "You" : `Bot ${declarerIdx}`} declared ${maxBid} tricks. Trump: ${trumpSuit}`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: UltiState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: UltiSettings): UltiState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, HAND_SIZE),
    deck.slice(HAND_SIZE, HAND_SIZE * 2),
    deck.slice(HAND_SIZE * 2, HAND_SIZE * 3),
  ];
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit: null,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    declarer: 0,
    bid: 0,
    tricks: [0, 0, 0],
    score: [0, 0],
    message: "Bid how many tricks you'll take (1-10). 3-player game: you vs 2 bots.",
  };
}

export function isTerminal(state: UltiState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 3)) };
}
