// Pidro – Canadian trick-taking game with bidding, partner variant played 4-player
// Player + Bot2 vs Bot1 + Bot3; trump chosen by highest bidder (2-6)
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PidroSettings {
  botDifficulty: "easy" | "hard";
}

export type PidroPhase = "bidding" | "playing" | "done";

export interface PidroState {
  settings: PidroSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit | null;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: PidroPhase;
  bids: readonly (number | null)[];
  highBid: number;
  highBidder: number;
  // Points scored: seat 0&2 vs seat 1&3
  teamPoints: readonly [number, number]; // [team0(0+2), team1(1+3)]
  teamScore: readonly [number, number];
  tricks: readonly number[];
  message: string;
}

export type PidroAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const HAND_SIZE = 9;

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

export function legalPlays(state: PidroState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  return followers.length > 0 ? followers : hand;
}

function botBid(hand: readonly Card[], currentHigh: number): number {
  let strong = 0;
  const suits = new Map<Suit, number>();
  for (const c of hand) {
    suits.set(c.suit, (suits.get(c.suit) ?? 0) + 1);
    if (c.rank === 1 || c.rank >= 12) strong++;
  }
  const longestSuit = Math.max(...suits.values());
  const bid = Math.min(6, strong + Math.floor(longestSuit / 3));
  return bid > currentHigh ? bid : 0;
}

function botPlay(state: PidroState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trump = state.trumpSuit!;
  const trick = state.currentTrick;
  if (trick.length === 0) {
    const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
    if (trumpCards.length > 0) return trumpCards[0]!;
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

function applyPlay(state: PidroState, seat: number, card: Card): PidroState {
  const trump = state.trumpSuit!;
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: PidroState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, trump);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      // Count trump points: A=4, K=3, Q=2, J=1, 5=5 (pidro card)
      const trumpPts = (trick: readonly { seat: number; card: Card }[], seat: number) => {
        let pts = 0;
        for (const { card: c } of newTrick) {
          if (c.suit !== trump) continue;
          if (c.rank === 1) pts += 4;
          else if (c.rank === 13) pts += 3;
          else if (c.rank === 12) pts += 2;
          else if (c.rank === 11) pts += 1;
          else if (c.rank === 5) pts += 5;
        }
        return pts;
        void trick; void seat;
      };
      // Simplified: each trick = 1 point; trump tricks = 2
      const t0 = newTricks[0]! + newTricks[2]!;
      const t1 = newTricks[1]! + newTricks[3]!;
      void trumpPts;
      const pPts = t0;
      const bPts = t1;
      const made = t0 >= state.highBid || state.highBidder % 2 !== 0;
      const teamWon = state.highBidder % 2 === 0 ? t0 >= state.highBid : t1 >= state.highBid;
      s = {
        ...s,
        teamPoints: [pPts, bPts],
        teamScore: [state.teamScore[0] + (teamWon && state.highBidder % 2 === 0 ? t0 : 0),
                    state.teamScore[1] + (teamWon && state.highBidder % 2 !== 0 ? t1 : 0)],
        phase: "done",
        message: `Team 0: ${t0} pts | Team 1: ${t1} pts. ${made ? "Bid made!" : "Set!"}`,
      };
      void made;
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: PidroState, action: PidroAction): PidroState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "bidding" && action.type === "bid") {
    if (state.turn !== 0) return state;
    const amount = action.amount;

    const newBids: (number | null)[] = [amount, null, null, null];
    let highBid = amount;
    let highBidder = 0;
    for (let i = 1; i < 4; i++) {
      const b = botBid(state.hands[i]!, highBid);
      newBids[i] = b;
      if (b > highBid) { highBid = b; highBidder = i; }
    }

    if (highBid < 2) {
      return { ...state, rngSeed: nextSeed, phase: "done", message: "No valid bid — no game played." };
    }

    const declarerHand = state.hands[highBidder]!;
    const suitCount = new Map<Suit, number>();
    for (const c of declarerHand) suitCount.set(c.suit, (suitCount.get(c.suit) ?? 0) + 1);
    let trumpSuit: Suit = "♠";
    let maxCount = 0;
    for (const [suit, count] of suitCount) {
      if (count > maxCount) { maxCount = count; trumpSuit = suit; }
    }

    return {
      ...state, rngSeed: nextSeed,
      bids: newBids, highBid, highBidder,
      trumpSuit, phase: "playing",
      turn: highBidder, leadSeat: highBidder,
      message: `${highBidder === 0 ? "You" : `Bot ${highBidder}`} bid ${highBid}. Trump: ${trumpSuit}`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: PidroState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: PidroSettings): PidroState {
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
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit: null,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    bids: [null, null, null, null],
    highBid: 1,
    highBidder: 0,
    teamPoints: [0, 0],
    teamScore: [0, 0],
    tricks: [0, 0, 0, 0],
    message: "Bid 2-6 tricks, or 0 to pass. You & Bot 2 vs Bot 1 & Bot 3.",
  };
}

export function isTerminal(state: PidroState): { score: number } | null {
  if (state.phase !== "done") return null;
  const [p, b] = state.teamScore;
  const total = p + b;
  return { score: total > 0 ? Math.round((p / total) * 100) : 50 };
}
