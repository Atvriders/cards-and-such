import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Rank Guess: A card is drawn. Guess the rank (2-A) before it is revealed.
// Correct = 50 pts. Within 2 ranks off = 20 pts. 10 rounds.

export interface CardRankGuessSettings { rounds: "5" | "10" | "15"; }

export interface CardRankGuessState {
  round: number;
  maxRounds: number;
  card: number;           // 0-51
  guess: number | null;   // rank index 0-12
  revealed: boolean;
  score: number;
  lastPoints: number | null;
  phase: "guessing" | "result" | "gameover";
  rngSeed: number;
}

export type CardRankGuessAction =
  | { type: "guess"; rank: number }
  | { type: "next" };

const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS = ["♠","♥","♦","♣"];
export function cardName(c: number): string { return RANKS[c % 13]! + SUITS[Math.floor(c / 13)]!; }
export function cardRank(c: number): number { return c % 13; }

function drawCard(seed: number): { card: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const card = Math.floor(rng() * 52);
  return { card, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: CardRankGuessSettings): CardRankGuessState {
  const { card, nextSeed } = drawCard(seed);
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), card, guess: null, revealed: false, score: 0, lastPoints: null, phase: "guessing", rngSeed: nextSeed };
}

export function reducer(state: CardRankGuessState, action: CardRankGuessAction): CardRankGuessState {
  if (state.phase === "gameover") return state;
  if (action.type === "guess") {
    if (state.phase !== "guessing" || state.guess !== null) return state;
    const actual = cardRank(state.card);
    const diff = Math.abs(action.rank - actual);
    const pts = diff === 0 ? 50 : diff <= 2 ? 20 : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "result";
    return { ...state, guess: action.rank, revealed: true, score: state.score + pts, lastPoints: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const { card, nextSeed } = drawCard(state.rngSeed);
    return { ...state, round: state.round + 1, card, guess: null, revealed: false, lastPoints: null, phase: "guessing", rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: CardRankGuessState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
