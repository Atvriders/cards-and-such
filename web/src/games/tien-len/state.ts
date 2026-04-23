import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TienLenSettings { dummy: "off" }
export type TienLenPhase = "playing" | "done";

export interface TienLenState {
  settings: TienLenSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: TienLenPhase;
  rngSeed: number;
}

export type TienLenAction = { type: "play"; cardIds: string[] } | { type: "pass" };

// Tien Len: 3 low, 2 high (same as Big Two but NO suit tiebreak — rank is enough for singles/pairs/triples)
// Straights: consecutive ranks 3 consecutive or more, no wrapping
// Four-of-a-kind bombs beat pairs of 2s
export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14; // Ace
  return r;
}

export type PlayType = "single" | "pair" | "triple" | "straight" | "fourkind";

export function classifyPlay(cards: readonly Card[]): PlayType | null {
  const n = cards.length;
  if (n === 0) return null;
  const ranks = cards.map(c => rankVal(c.rank));
  const allSame = ranks.every(r => r === ranks[0]);

  if (n === 1) return "single";
  if (n === 2 && allSame) return "pair";
  if (n === 3 && allSame) return "triple";
  if (n === 4 && allSame) return "fourkind";

  // Straight: 3+ consecutive unique ranks (no 2s in straights in Tien Len)
  if (n >= 3) {
    const sorted = [...new Set(ranks)].sort((a, b) => a - b);
    if (sorted.length === n && sorted[sorted.length - 1]! - sorted[0]! === n - 1 && !ranks.includes(15)) {
      return "straight";
    }
  }

  return null;
}

// Compare plays of same type
export function beats(play: readonly Card[], last: readonly Card[]): boolean {
  const pt = classifyPlay(play);
  const lt = classifyPlay(last);
  if (!pt || !lt) return false;

  // Four-of-a-kind beats pairs/triples/singles of 2s
  if (pt === "fourkind" && lt !== "fourkind") {
    return last.every(c => c.rank === 2);
  }

  if (pt !== lt) return false;

  const highPlay = Math.max(...play.map(c => rankVal(c.rank)));
  const highLast = Math.max(...last.map(c => rankVal(c.rank)));

  if (pt === "straight") {
    if (play.length !== last.length) return false;
    return highPlay > highLast;
  }

  return highPlay > highLast;
}

export function isLegalPlay(cards: readonly Card[], lastPlay: readonly Card[] | null): boolean {
  if (cards.length === 0) return false;
  if (!classifyPlay(cards)) return false;
  if (lastPlay === null) return true;
  return beats(cards, lastPlay);
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null): string[] | null {
  if (lastPlay === null) {
    const sorted = [...hand].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
    return [sorted[0]!.id];
  }
  const lt = classifyPlay(lastPlay);
  if (!lt) return null;
  const n = lastPlay.length;

  // Try same type
  const groups = new Map<number, Card[]>();
  for (const c of hand) {
    const rv = rankVal(c.rank);
    const arr = groups.get(rv) ?? [];
    arr.push(c);
    groups.set(rv, arr);
  }

  if (lt === "single" || lt === "pair" || lt === "triple") {
    const candidates: Card[][] = [];
    for (const [, g] of groups) {
      if (g.length >= n) {
        const sub = g.slice(0, n);
        if (isLegalPlay(sub, lastPlay)) candidates.push(sub);
      }
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => rankVal(a[0]!.rank) - rankVal(b[0]!.rank));
      return candidates[0]!.map(c => c.id);
    }
  }

  if (lt === "straight") {
    // Find a straight of same length that beats it
    const sorted = [...hand].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
    for (let start = 0; start <= sorted.length - n; start++) {
      const sub = sorted.slice(start, start + n);
      if (isLegalPlay(sub, lastPlay)) return sub.map(c => c.id);
    }
  }

  return null;
}

function nextActive(state: TienLenState, from: number): number {
  let next = (from + 1) % 4;
  for (let i = 0; i < 4; i++) {
    if (!state.finishOrder.includes(next) && state.hands[next]!.length > 0) return next;
    next = (next + 1) % 4;
  }
  return next;
}

function applyPlay(state: TienLenState, seat: number, cardIds: string[]): TienLenState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)!);
  if (played.some(c => !c) || !isLegalPlay(played, state.lastPlay)) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  let finishOrder = [...state.finishOrder];
  if (newHand.length === 0) finishOrder = [...finishOrder, seat];

  if (finishOrder.length >= 3) {
    const last = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, finishOrder: [...finishOrder, last], phase: "done" };
  }

  const next = nextActive({ ...state, hands: newHands, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: TienLenState, seat: number): TienLenState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s) && state.hands[s]!.length > 0);
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlaySeat: null, turn: lead };
  }
  return { ...state, passCount: newPass, turn: nextActive(state, seat) };
}

function runBots(state: TienLenState): TienLenState {
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

export function initialState(seed: number, settings: TienLenSettings): TienLenState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  let leadSeat = 0;
  for (let s = 0; s < 4; s++) {
    if (hands[s]!.some(c => c.rank === 3 && c.suit === "♠")) { leadSeat = s; break; }
  }

  let state: TienLenState = {
    settings, hands, turn: leadSeat, lastPlay: null, lastPlaySeat: null,
    passCount: 0, finishOrder: [], phase: "playing", rngSeed: nextSeed,
  };

  if (leadSeat !== 0) state = runBots(state);
  return state;
}

export function reducer(state: TienLenState, action: TienLenAction): TienLenState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: TienLenState = { ...state, rngSeed: nextSeed };

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

export function isTerminal(state: TienLenState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  return { score: [100, 60, 30, 0][pos] ?? 0 };
}
