import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ZhengSettings { dummy: "off" }

export type ZhengPhase = "playing" | "done";

export type PlayType = "single" | "pair" | "triple" | "quad" | "sequence" | "pairSequence";

export interface ZhengState {
  settings: ZhengSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlayType: PlayType | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: ZhengPhase;
  rngSeed: number;
}

export type ZhengAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14;
  return r;
}

function highRank(cards: readonly Card[]): number {
  return Math.max(...cards.map(c => rankVal(c.rank)));
}

export function classifyPlay(cards: readonly Card[]): PlayType | null {
  const n = cards.length;
  if (n === 0) return null;

  const sorted = [...cards].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
  const ranks = sorted.map(c => rankVal(c.rank));

  if (n === 1) return "single";

  // Pair
  if (n === 2 && ranks[0] === ranks[1]) return "pair";

  // Triple
  if (n === 3 && ranks[0] === ranks[1] && ranks[1] === ranks[2]) return "triple";

  // Quad (bomb)
  if (n === 4 && ranks.every(r => r === ranks[0])) return "quad";

  // Sequence (5+ consecutive singles)
  if (n >= 5) {
    const uniq = [...new Set(ranks)].sort((a, b) => a - b);
    if (uniq.length === n && uniq[n - 1]! - uniq[0]! === n - 1 && !ranks.includes(15)) return "sequence";
  }

  // Pair sequence (3+ consecutive pairs)
  if (n >= 6 && n % 2 === 0) {
    const groups = new Map<number, number>();
    for (const r of ranks) groups.set(r, (groups.get(r) ?? 0) + 1);
    const pairRanks = [...groups.entries()].filter(([, cnt]) => cnt === 2).map(([r]) => r).sort((a, b) => a - b);
    if (pairRanks.length === n / 2) {
      const consec = pairRanks.every((r, i) => i === 0 || r === pairRanks[i - 1]! + 1);
      if (consec && !pairRanks.includes(15)) return "pairSequence";
    }
  }

  return null;
}

export function isLegalPlay(cards: readonly Card[], lastPlay: readonly Card[] | null, lastType: PlayType | null): boolean {
  if (cards.length === 0) return false;
  const type = classifyPlay(cards);
  if (!type) return false;
  if (lastPlay === null) return true;

  // Quads beat anything
  if (type === "quad" && lastType !== "quad") return true;
  if (type !== "quad" && lastType === "quad") return false;

  if (type !== lastType) return false;
  if (cards.length !== lastPlay.length) return false;
  return highRank(cards) > highRank(lastPlay);
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null, lastType: PlayType | null): string[] | null {
  if (lastPlay === null) {
    // Lead lowest single
    const sorted = [...hand].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
    return [sorted[0]!.id];
  }

  const n = lastPlay.length;
  const threshold = highRank(lastPlay);

  // Try matching type with lowest valid set
  const groups = new Map<number, Card[]>();
  for (const c of hand) {
    const rv = rankVal(c.rank);
    const arr = groups.get(rv) ?? [];
    arr.push(c);
    groups.set(rv, arr);
  }

  if (lastType === "single" || lastType === "pair" || lastType === "triple" || lastType === "quad") {
    const candidates: Card[][] = [];
    for (const [rv, g] of groups) {
      if (g.length >= n && rv > threshold) {
        candidates.push(g.slice(0, n));
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => rankVal(a[0]!.rank) - rankVal(b[0]!.rank));
    return candidates[0]!.map(c => c.id);
  }

  return null; // pass on sequences for simplicity
}

function nextActiveSeat(state: ZhengState, from: number): number {
  let next = (from + 1) % 4;
  let t = 0;
  while (t < 4 && state.finishOrder.includes(next)) {
    next = (next + 1) % 4;
    t++;
  }
  return next;
}

function applyPlay(state: ZhengState, seat: number, cardIds: string[]): ZhengState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)!);
  if (played.some(c => !c)) return state;

  const type = classifyPlay(played);
  if (!isLegalPlay(played, state.lastPlay, state.lastPlayType)) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);

  let finishOrder = [...state.finishOrder];
  if (newHand.length === 0 && !finishOrder.includes(seat)) finishOrder = [...finishOrder, seat];

  if (finishOrder.length >= 3) {
    const last = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    return { ...state, hands: newHands, lastPlay: played, lastPlayType: type, lastPlaySeat: seat, passCount: 0, finishOrder: [...finishOrder, last], phase: "done" };
  }

  const next = nextActiveSeat({ ...state, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlayType: type, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: ZhengState, seat: number): ZhengState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s));
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlayType: null, lastPlaySeat: null, turn: lead };
  }
  return { ...state, passCount: newPass, turn: nextActiveSeat(state, seat) };
}

function runBots(state: ZhengState): ZhengState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 300) {
    safety++;
    const seat = s.turn;
    if (s.finishOrder.includes(seat)) { s = applyPass(s, seat); continue; }
    const play = botPlay(s.hands[seat]!, s.lastPlay, s.lastPlayType);
    if (play) {
      const next = applyPlay(s, seat, play);
      s = next === s ? applyPass(s, seat) : next;
    } else {
      s = applyPass(s, seat);
    }
  }
  return s;
}

export function initialState(seed: number, settings: ZhengSettings): ZhengState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  return {
    settings, hands, turn: 0, lastPlay: null, lastPlayType: null, lastPlaySeat: null,
    passCount: 0, finishOrder: [], phase: "playing", rngSeed: nextSeed,
  };
}

export function reducer(state: ZhengState, action: ZhengAction): ZhengState {
  if (state.phase === "done" || state.turn !== 0) return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: ZhengState = { ...state, rngSeed: nextSeed };

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

export function isTerminal(state: ZhengState): { score: number } | null {
  if (state.phase !== "done") return null;
  const pos = state.finishOrder.indexOf(0);
  if (pos < 0) return { score: 0 };
  return { score: [100, 60, 30, 0][pos] ?? 0 };
}
