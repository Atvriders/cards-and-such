import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DaifugoSettings { dummy: "off" }

export type DaifugoPhase = "playing" | "done";

export interface DaifugoState {
  settings: DaifugoSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: DaifugoPhase;
  rngSeed: number;
}

export type DaifugoAction = { type: "play"; cardIds: string[] } | { type: "pass" };

// Daifugo rank order: 3 low … K … A … 2 high, Jokers highest
// Suit doesn't matter for legality, only count and rank
export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14; // Ace
  return r; // 3..13
}

function cardVal(c: Card): number {
  return rankVal(c.rank);
}

export function isLegalPlay(cards: readonly Card[], lastPlay: readonly Card[] | null): boolean {
  if (cards.length === 0) return false;
  // All played cards must be the same rank
  if (!cards.every(c => c.rank === cards[0]!.rank)) return false;
  if (lastPlay === null) return true; // any valid hand leads

  // Must match card count
  if (cards.length !== lastPlay.length) return false;

  // All cards in the play must be the same rank (pairs, triples, etc.)
  if (!cards.every(c => c.rank === cards[0]!.rank)) return false;
  if (!lastPlay.every(c => c.rank === lastPlay[0]!.rank)) return false;

  return cardVal(cards[0]!) > cardVal(lastPlay[0]!);
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null): string[] | null {
  const n = lastPlay ? lastPlay.length : 1;
  const threshold = lastPlay ? rankVal(lastPlay[0]!.rank) : 0;

  // Group by rank
  const groups = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = groups.get(c.rank) ?? [];
    arr.push(c);
    groups.set(c.rank, arr);
  }

  let best: Card[] | null = null;
  for (const [, g] of groups) {
    if (g.length >= n && rankVal(g[0]!.rank) > threshold) {
      const sub = g.slice(0, n);
      if (!best || rankVal(sub[0]!.rank) < rankVal(best[0]!.rank)) best = sub;
    }
  }
  return best ? best.map(c => c.id) : null;
}

function nextActiveSeat(state: DaifugoState, from: number): number {
  let next = (from + 1) % 4;
  let t = 0;
  while (t < 4 && state.finishOrder.includes(next)) {
    next = (next + 1) % 4;
    t++;
  }
  return next;
}

function applyPlay(state: DaifugoState, seat: number, cardIds: string[]): DaifugoState {
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
    const last = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, finishOrder: [...finishOrder, last], phase: "done" };
  }

  const next = nextActiveSeat({ ...state, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: DaifugoState, seat: number): DaifugoState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s));
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlaySeat: null, turn: lead };
  }
  const next = nextActiveSeat(state, seat);
  return { ...state, passCount: newPass, turn: next };
}

function runBots(state: DaifugoState): DaifugoState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 300) {
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

export function initialState(seed: number, settings: DaifugoSettings): DaifugoState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  // Player holding 3♣ leads
  let leadSeat = 0;
  for (let s = 0; s < 4; s++) {
    if (hands[s]!.some(c => c.rank === 3 && c.suit === "♣")) { leadSeat = s; break; }
  }

  let state: DaifugoState = {
    settings, hands, turn: leadSeat, lastPlay: null, lastPlaySeat: null,
    passCount: 0, finishOrder: [], phase: "playing", rngSeed: nextSeed,
  };

  if (leadSeat !== 0) state = runBots(state);
  return state;
}

export function reducer(state: DaifugoState, action: DaifugoAction): DaifugoState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: DaifugoState = { ...state, rngSeed: nextSeed };

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

export function isTerminal(state: DaifugoState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  if (pos < 0) return { score: 0 };
  return { score: [100, 60, 30, 0][pos] ?? 0 };
}
