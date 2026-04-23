import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BigTwoSettings { dummy: "off" }

export type BigTwoPhase = "playing" | "done";

export type HandType = "single" | "pair" | "triple" | "fivecard";

export interface BigTwoState {
  settings: BigTwoSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: BigTwoPhase;
  rngSeed: number;
}

export type BigTwoAction = { type: "play"; cardIds: string[] } | { type: "pass" };

// Rank ordering: 3 low … A … 2 high
// Suit ordering for tiebreak: ♦ < ♣ < ♥ < ♠
const SUIT_ORDER: Record<Suit, number> = { "♦": 0, "♣": 1, "♥": 2, "♠": 3 };

export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14; // Ace
  return r; // 3..13
}

function cardVal(c: Card): number {
  return rankVal(c.rank) * 4 + SUIT_ORDER[c.suit];
}

function handType(cards: readonly Card[]): HandType | null {
  const n = cards.length;
  if (n === 1) return "single";
  if (n === 2) {
    if (cards[0]!.rank === cards[1]!.rank) return "pair";
    return null;
  }
  if (n === 3) {
    if (cards.every(c => c.rank === cards[0]!.rank)) return "triple";
    return null;
  }
  if (n === 5) return fiveCardType(cards) ? "fivecard" : null;
  return null;
}

// Returns a numeric score for 5-card hands (higher = better)
// Categories: straight(1) < flush(2) < full house(3) < four-of-a-kind(4) < straight flush(5)
// Within category, compare by highest card value
export function fiveCardType(cards: readonly Card[]): number | null {
  if (cards.length !== 5) return null;
  const sorted = [...cards].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
  const ranks = sorted.map(c => rankVal(c.rank));
  const suits = sorted.map(c => c.suit);
  const rankCounts = new Map<number, number>();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);
  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = ((): boolean => {
    const uniq = [...new Set(ranks)].sort((a, b) => a - b);
    if (uniq.length !== 5) return false;
    return uniq[4]! - uniq[0]! === 4;
  })();
  const highCard = Math.max(...ranks) * 4 + SUIT_ORDER[sorted[sorted.length - 1]!.suit];
  if (isStraight && isFlush) return 500 + highCard;
  if (counts[0] === 4) return 400 + highCard;
  if (counts[0] === 3 && counts[1] === 2) return 300 + highCard;
  if (isFlush) return 200 + highCard;
  if (isStraight) return 100 + highCard;
  return null;
}

function highCardOfPlay(cards: readonly Card[]): number {
  return Math.max(...cards.map(c => cardVal(c)));
}

export function isLegalPlay(
  cards: readonly Card[],
  lastPlay: readonly Card[] | null
): boolean {
  if (cards.length === 0) return false;
  const ht = handType(cards);
  if (ht === null) return false;

  if (lastPlay === null) return true;

  const lt = handType(lastPlay);
  if (lt === null) return false;
  if (ht !== lt) return false;

  if (ht === "fivecard") {
    const score = fiveCardType(cards)!;
    const lastScore = fiveCardType(lastPlay)!;
    return score > lastScore;
  }

  return highCardOfPlay(cards) > highCardOfPlay(lastPlay);
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null): string[] | null {
  // Try singles first; for opening, play lowest 3♦ if available
  if (lastPlay === null) {
    // Must play — find lowest legal single
    const sorted = [...hand].sort((a, b) => cardVal(a) - cardVal(b));
    return [sorted[0]!.id];
  }

  const n = lastPlay.length;
  const ht = handType(lastPlay);

  if (ht === "single" || ht === "pair" || ht === "triple") {
    // Try matching count
    const groups = new Map<Rank, Card[]>();
    for (const c of hand) {
      const arr = groups.get(c.rank) ?? [];
      arr.push(c);
      groups.set(c.rank, arr);
    }
    const candidates: Card[][] = [];
    for (const [, g] of groups) {
      if (g.length >= n) {
        const sub = g.slice(0, n);
        if (isLegalPlay(sub, lastPlay)) candidates.push(sub);
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => highCardOfPlay(a) - highCardOfPlay(b));
    return candidates[0]!.map(c => c.id);
  }

  return null; // pass on 5-card for simplicity
}

function runBots(state: BigTwoState): BigTwoState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 300) {
    safety++;
    const seat = s.turn;
    if (s.finishOrder.includes(seat)) {
      s = applyPass(s, seat);
      continue;
    }
    const play = botPlay(s.hands[seat]!, s.lastPlay);
    if (play) {
      const next = applyPlay(s, seat, play);
      s = next === s ? applyPass(s, seat) : next;
    } else {
      s = applyPass(s, seat);
    }
  }
  return s;
}

function nextActiveSeat(state: BigTwoState, from: number): number {
  let next = (from + 1) % 4;
  let t = 0;
  while (t < 4 && (state.finishOrder.includes(next) || state.hands[next]!.length === 0)) {
    next = (next + 1) % 4;
    t++;
  }
  return next;
}

function applyPlay(state: BigTwoState, seat: number, cardIds: string[]): BigTwoState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)!);
  if (played.some(c => !c)) return state;
  if (!isLegalPlay(played, state.lastPlay)) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);

  let finishOrder = [...state.finishOrder];
  if (newHand.length === 0 && !finishOrder.includes(seat)) {
    finishOrder = [...finishOrder, seat];
  }

  if (finishOrder.length >= 3) {
    const lastSeat = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, finishOrder: [...finishOrder, lastSeat], phase: "done" };
  }

  const next = nextActiveSeat({ ...state, hands: newHands, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: BigTwoState, seat: number): BigTwoState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s) && state.hands[s]!.length > 0);
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    // Round over, last player who played leads
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlaySeat: null, turn: lead };
  }
  const next = nextActiveSeat(state, seat);
  return { ...state, passCount: newPass, turn: next };
}

export function initialState(seed: number, settings: BigTwoSettings): BigTwoState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  // 3♦ leads
  let leadSeat = 0;
  for (let s = 0; s < 4; s++) {
    if (hands[s]!.some(c => c.rank === 3 && c.suit === "♦")) { leadSeat = s; break; }
  }

  let state: BigTwoState = {
    settings, hands, turn: leadSeat, lastPlay: null, lastPlaySeat: null,
    passCount: 0, finishOrder: [], phase: "playing", rngSeed: nextSeed,
  };

  if (leadSeat !== 0) state = runBots(state);
  return state;
}

export function reducer(state: BigTwoState, action: BigTwoAction): BigTwoState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: BigTwoState = { ...state, rngSeed: nextSeed };

  if (action.type === "play") {
    const next = applyPlay(s, 0, action.cardIds);
    if (next === s) return state;
    s = next;
  } else if (action.type === "pass") {
    s = applyPass(s, 0);
  } else {
    return state;
  }

  if (s.phase === "done") return s;
  return runBots(s);
}

export function isTerminal(state: BigTwoState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  if (pos < 0) return { score: 0 };
  return { score: [100, 60, 30, 0][pos] ?? 0 };
}
