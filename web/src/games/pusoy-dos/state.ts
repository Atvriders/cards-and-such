import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pusoy Dos: Philippine variant of Big Two
// Suit order: ♦ < ♣ < ♥ < ♠  (same as Big Two)
// Rank: 3 low → 2 high (same)
// Scoring: winner earns points based on remaining cards of losers
// Cards left 1-9 = face value, 10-12 = 10pts each, 13-15 (K/A/2) = 13/14/15 pts
// Simplified: we track finish order and compute score from cards remaining

export interface PusoyDosSettings { dummy: "off" }
export type PusoyDosPhase = "playing" | "done";

export interface PusoyDosState {
  settings: PusoyDosSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: PusoyDosPhase;
  score: number; // player's final score (points won from bots)
  rngSeed: number;
}

export type PusoyDosAction = { type: "play"; cardIds: string[] } | { type: "pass" };

const SUIT_ORDER: Record<Suit, number> = { "♦": 0, "♣": 1, "♥": 2, "♠": 3 };

export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14;
  return r;
}

function cardVal(c: Card): number {
  return rankVal(c.rank) * 4 + SUIT_ORDER[c.suit];
}

function cardPts(c: Card): number {
  const rv = rankVal(c.rank);
  if (rv <= 9) return rv - 2; // rank 3..9 → 1..7 (rough)
  if (rv <= 12) return 10;
  return rv; // K=13, A=14, 2=15
}

export type PusoyHandType = "single" | "pair" | "triple" | "fivecard";

export function handType(cards: readonly Card[]): PusoyHandType | null {
  const n = cards.length;
  if (n === 1) return "single";
  if (n === 2 && cards[0]!.rank === cards[1]!.rank) return "pair";
  if (n === 3 && cards.every(c => c.rank === cards[0]!.rank)) return "triple";
  if (n === 5) {
    const ranks = cards.map(c => rankVal(c.rank));
    const suits = cards.map(c => c.suit);
    const rankCounts = new Map<number, number>();
    for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);
    const counts = [...rankCounts.values()].sort((a, b) => b - a);
    const isFlush = suits.every(s => s === suits[0]);
    const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
    const isStraight = sortedRanks.length === 5 && sortedRanks[4]! - sortedRanks[0]! === 4;
    if (isStraight || isFlush || counts[0]! >= 3) return "fivecard";
    return null;
  }
  return null;
}

export function fiveCardScore(cards: readonly Card[]): number {
  const ranks = cards.map(c => rankVal(c.rank));
  const suits = cards.map(c => c.suit);
  const rankCounts = new Map<number, number>();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);
  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
  const isStraight = sortedRanks.length === 5 && sortedRanks[4]! - sortedRanks[0]! === 4;
  const high = Math.max(...cards.map(c => cardVal(c)));
  if (isStraight && isFlush) return 500 + high;
  if (counts[0] === 4) return 400 + high;
  if (counts[0] === 3 && counts[1] === 2) return 300 + high;
  if (isFlush) return 200 + high;
  if (isStraight) return 100 + high;
  return 0;
}

export function isLegalPlay(cards: readonly Card[], lastPlay: readonly Card[] | null): boolean {
  if (cards.length === 0) return false;
  const ht = handType(cards);
  if (!ht) return false;
  if (lastPlay === null) return true;
  const lt = handType(lastPlay);
  if (!lt || ht !== lt) return false;
  if (ht === "fivecard") return fiveCardScore(cards) > fiveCardScore(lastPlay);
  return Math.max(...cards.map(c => cardVal(c))) > Math.max(...lastPlay.map(c => cardVal(c)));
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null): string[] | null {
  if (lastPlay === null) {
    return [[...hand].sort((a, b) => cardVal(a) - cardVal(b))[0]!.id];
  }
  const lt = handType(lastPlay);
  if (!lt) return null;
  const n = lastPlay.length;
  if (lt !== "fivecard") {
    const groups = new Map<Rank, Card[]>();
    for (const c of hand) { const a = groups.get(c.rank) ?? []; a.push(c); groups.set(c.rank, a); }
    const cands: Card[][] = [];
    for (const [, g] of groups) {
      if (g.length >= n) {
        const sub = g.slice(0, n);
        if (isLegalPlay(sub, lastPlay)) cands.push(sub);
      }
    }
    if (cands.length === 0) return null;
    cands.sort((a, b) => Math.max(...a.map(c => cardVal(c))) - Math.max(...b.map(c => cardVal(c))));
    return cands[0]!.map(c => c.id);
  }
  return null;
}

function nextActive(state: PusoyDosState, from: number): number {
  let next = (from + 1) % 4;
  for (let i = 0; i < 4; i++) {
    if (!state.finishOrder.includes(next) && state.hands[next]!.length > 0) return next;
    next = (next + 1) % 4;
  }
  return next;
}

function applyPlay(state: PusoyDosState, seat: number, cardIds: string[]): PusoyDosState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)!);
  if (played.some(c => !c) || !isLegalPlay(played, state.lastPlay)) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  let finishOrder = [...state.finishOrder];
  if (newHand.length === 0) finishOrder = [...finishOrder, seat];

  if (finishOrder.length >= 3) {
    const last = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    const finalOrder = [...finishOrder, last];
    // Score: winner gets points = sum of all losers' remaining card points
    const winnerSeat = finalOrder[0]!;
    let score = 0;
    if (winnerSeat === 0) {
      for (let s = 1; s < 4; s++) score += newHands[s]!.reduce((a, c) => a + cardPts(c), 0);
    }
    return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, finishOrder: finalOrder, phase: "done", score };
  }

  const next = nextActive({ ...state, hands: newHands, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: PusoyDosState, seat: number): PusoyDosState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s) && state.hands[s]!.length > 0);
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlaySeat: null, turn: lead };
  }
  return { ...state, passCount: newPass, turn: nextActive(state, seat) };
}

function runBots(state: PusoyDosState): PusoyDosState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 400) {
    safety++;
    const seat = s.turn;
    if (s.finishOrder.includes(seat)) { s = applyPass(s, seat); continue; }
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

export function initialState(seed: number, settings: PusoyDosSettings): PusoyDosState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  let leadSeat = 0;
  for (let s = 0; s < 4; s++) {
    if (hands[s]!.some(c => c.rank === 3 && c.suit === "♦")) { leadSeat = s; break; }
  }

  let state: PusoyDosState = {
    settings, hands, turn: leadSeat, lastPlay: null, lastPlaySeat: null,
    passCount: 0, finishOrder: [], phase: "playing", score: 0, rngSeed: nextSeed,
  };

  if (leadSeat !== 0) state = runBots(state);
  return state;
}

export function reducer(state: PusoyDosState, action: PusoyDosAction): PusoyDosState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: PusoyDosState = { ...state, rngSeed: nextSeed };

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

export function isTerminal(state: PusoyDosState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  if (pos === 0) return { score: Math.max(100, state.score) };
  return { score: [0, 60, 30, 0][pos] ?? 0 };
}
