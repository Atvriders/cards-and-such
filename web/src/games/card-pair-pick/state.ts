import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Pair Pick: 6 face-down cards laid out. Find 2 that share the same rank.
// Click any 2 cards. If they match rank -> 30 pts. If not -> 0 pts and try again.
// 8 rounds.

export interface CardPairPickSettings { rounds: "6" | "8" | "10"; }

export interface CardPairPickState {
  round: number;
  maxRounds: number;
  cards: number[];         // 6 card indices
  flipped: number[];       // which positions are face-up (during pick)
  matched: boolean | null; // null = not tried yet
  picks: number[];         // selected positions
  score: number;
  phase: "picking" | "result" | "gameover";
  rngSeed: number;
}

export type CardPairPickAction =
  | { type: "flip"; pos: number }
  | { type: "confirm" }
  | { type: "next" };

const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS = ["♠","♥","♦","♣"];
export function cardName(c: number): string { return RANKS[c % 13]! + SUITS[Math.floor(c / 13)]!; }

function makeRound(seed: number): { cards: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  // Pick 2 ranks for the pair, then fill with 4 distinct other cards
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j]!, deck[i]!]; }
  const pair1 = deck[0]!;
  // find another card with same rank
  const sameRank = deck.find(c => c !== pair1 && c % 13 === pair1 % 13)!;
  const others = deck.filter(c => c % 13 !== pair1 % 13).slice(0, 4);
  const cards = [pair1, sameRank, ...others];
  // shuffle positions
  for (let i = 5; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [cards[i], cards[j]] = [cards[j]!, cards[i]!]; }
  return { cards, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: CardPairPickSettings): CardPairPickState {
  const { cards, nextSeed } = makeRound(seed);
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), cards, flipped: [], matched: null, picks: [], score: 0, phase: "picking", rngSeed: nextSeed };
}

export function reducer(state: CardPairPickState, action: CardPairPickAction): CardPairPickState {
  if (state.phase === "gameover") return state;
  if (action.type === "flip") {
    if (state.phase !== "picking" || state.picks.length >= 2 || state.picks.includes(action.pos)) return state;
    const picks = [...state.picks, action.pos];
    const flipped = [...state.flipped, action.pos];
    return { ...state, picks, flipped };
  }
  if (action.type === "confirm") {
    if (state.picks.length !== 2) return state;
    const [a, b] = state.picks as [number, number];
    const matched = state.cards[a]! % 13 === state.cards[b]! % 13;
    const pts = matched ? 30 : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "result";
    return { ...state, matched, score: state.score + pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const { cards, nextSeed } = makeRound(state.rngSeed);
    return { ...state, round: state.round + 1, cards, flipped: [], matched: null, picks: [], phase: "picking", rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: CardPairPickState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
