import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Shuffle Bet: 3 cards face-up are shown briefly, then shuffled face-down.
// Track the highest-ranked card. After shuffle, pick the position of the highest card.
// Correct = 40pts. 8 rounds.

export interface CardShuffleBetSettings { rounds: "6" | "8" | "10"; }

export interface CardShuffleBetState {
  round: number;
  maxRounds: number;
  cards: number[];         // 3 card values
  positions: number[];     // current permutation [0,1,2]
  highestPos: number;      // which logical card is highest
  phase: "memorize" | "guess" | "result" | "gameover";
  guess: number | null;
  score: number;
  rngSeed: number;
}

export type CardShuffleBetAction =
  | { type: "ready" }       // done memorizing
  | { type: "guess"; pos: number }
  | { type: "next" };

const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS = ["♠","♥","♦","♣"];
export function cardName(c: number): string { return RANKS[c % 13]! + SUITS[Math.floor(c / 13)]!; }

function makeRound(seed: number): { cards: number[]; highestPos: number; positions: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  // Pick 3 distinct cards with different ranks
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j]!, deck[i]!]; }
  const cards = [deck[0]!, deck[1]!, deck[2]!];
  const highestLogical = cards.reduce((best, c, i) => c % 13 > cards[best]! % 13 ? i : best, 0);
  // shuffle positions
  const positions = [0, 1, 2];
  for (let i = 2; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [positions[i], positions[j]] = [positions[j]!, positions[i]!]; }
  const highestPos = positions.indexOf(highestLogical);
  return { cards, highestPos, positions, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: CardShuffleBetSettings): CardShuffleBetState {
  const { cards, highestPos, positions, nextSeed } = makeRound(seed);
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), cards, positions, highestPos, phase: "memorize", guess: null, score: 0, rngSeed: nextSeed };
}

export function reducer(state: CardShuffleBetState, action: CardShuffleBetAction): CardShuffleBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "ready") {
    if (state.phase !== "memorize") return state;
    return { ...state, phase: "guess" };
  }
  if (action.type === "guess") {
    if (state.phase !== "guess") return state;
    const correct = action.pos === state.highestPos;
    const pts = correct ? 40 : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "result";
    return { ...state, guess: action.pos, score: state.score + pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const { cards, highestPos, positions, nextSeed } = makeRound(state.rngSeed);
    return { ...state, round: state.round + 1, cards, highestPos, positions, phase: "memorize", guess: null, rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: CardShuffleBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
