import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TichuSettings { dummy: "off" }

export type TichuPhase = "playing" | "done";

export interface TichuState {
  settings: TichuSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: TichuPhase;
  scores: readonly [number, number]; // team 0&2 vs team 1&3
  rngSeed: number;
}

export type TichuAction = { type: "play"; cardIds: string[] } | { type: "pass" };

// Tichu uses simplified rank values (no special cards in this implementation)
export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14;
  return r;
}

function cardVal(c: Card): number {
  return rankVal(c.rank);
}

export function isLegalPlay(cards: readonly Card[], lastPlay: readonly Card[] | null): boolean {
  if (cards.length === 0) return false;
  if (!cards.every(c => c.rank === cards[0]!.rank)) return false;
  if (lastPlay === null) return true;
  if (cards.length !== lastPlay.length) return false;
  if (!lastPlay.every(c => c.rank === lastPlay[0]!.rank)) return false;
  return cardVal(cards[0]!) > cardVal(lastPlay[0]!);
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null): string[] | null {
  const n = lastPlay ? lastPlay.length : 1;
  const threshold = lastPlay ? rankVal(lastPlay[0]!.rank) : 0;
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

function nextActiveSeat(state: TichuState, from: number): number {
  let next = (from + 1) % 4;
  let t = 0;
  while (t < 4 && state.finishOrder.includes(next)) {
    next = (next + 1) % 4;
    t++;
  }
  return next;
}

function applyPlay(state: TichuState, seat: number, cardIds: string[]): TichuState {
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

  // Check for double victory (teammates finish 1st and 2nd)
  if (finishOrder.length >= 2) {
    const [first, second] = finishOrder;
    if (first !== undefined && second !== undefined && first % 2 === second % 2) {
      // Same team wins double — 200 pts to winning team
      const winTeam = first % 2;
      const scores: [number, number] = [state.scores[0] ?? 0, state.scores[1] ?? 0];
      scores[winTeam] = (scores[winTeam] ?? 0) + 200;
      const last = [0, 1, 2, 3].filter(s => !finishOrder.includes(s));
      return { ...state, hands: newHands, finishOrder: [...finishOrder, ...last], phase: "done", scores };
    }
  }

  if (finishOrder.length >= 3) {
    const last = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    const finalOrder = [...finishOrder, last];
    // Score: 1st player team gets 100, last player loses cards to 1st team
    const scores: [number, number] = [state.scores[0] ?? 0, state.scores[1] ?? 0];
    // Simple scoring: team of seat[0] of finishOrder gets 100 bonus
    const winTeam = finalOrder[0]! % 2;
    scores[winTeam] = (scores[winTeam] ?? 0) + 100;
    return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, finishOrder: finalOrder, phase: "done", scores };
  }

  const next = nextActiveSeat({ ...state, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: TichuState, seat: number): TichuState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s));
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlaySeat: null, turn: lead };
  }
  const next = nextActiveSeat(state, seat);
  return { ...state, passCount: newPass, turn: next };
}

function runBots(state: TichuState): TichuState {
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

export function initialState(seed: number, settings: TichuSettings): TichuState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  let state: TichuState = {
    settings, hands, turn: 0, lastPlay: null, lastPlaySeat: null,
    passCount: 0, finishOrder: [], phase: "playing",
    scores: [0, 0], rngSeed: nextSeed,
  };
  return state;
}

export function reducer(state: TichuState, action: TichuAction): TichuState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: TichuState = { ...state, rngSeed: nextSeed };

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

export function isTerminal(state: TichuState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  if (pos < 0) return { score: 0 };
  // Your team is 0&2, score based on team performance
  const teamScore = state.scores[0];
  return { score: Math.min(100, teamScore) };
}
