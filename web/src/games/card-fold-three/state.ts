import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Fold Three: See 3 cards. Choose to "fold" (score lowest) or "stand" (score highest or middle).
export interface CardFoldThreeSettings { rounds: "10" | "20"; }

export interface CardFoldThreeState {
  deck: number[];
  pos: number;
  hand: number[];
  coins: number;
  round: number;
  maxRounds: number;
  phase: "decide" | "result" | "gameover";
  choice: "fold" | "stand" | null;
  lastScore: number;
}

export type CardFoldThreeAction = { type: "fold" } | { type: "stand" } | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardLabel(c: number): string {
  return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]! + ["♠","♥","♦","♣"][Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { return Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2; }

export function initialState(seed: number, settings: CardFoldThreeSettings): CardFoldThreeState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 3, hand: deck.slice(0, 3), coins: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "decide", choice: null, lastScore: 0 };
}

export function reducer(state: CardFoldThreeState, action: CardFoldThreeAction): CardFoldThreeState {
  if (state.phase === "gameover") return state;
  if (action.type === "fold") {
    if (state.phase !== "decide") return state;
    const ranks = state.hand.map(c => c % 13);
    const min = Math.min(...ranks);
    const score = min + 2;
    return { ...state, choice: "fold", lastScore: score, coins: state.coins + score, phase: "result" };
  }
  if (action.type === "stand") {
    if (state.phase !== "decide") return state;
    const ranks = state.hand.map(c => c % 13);
    const max = Math.max(...ranks);
    const score = max + 2;
    return { ...state, choice: "stand", lastScore: score, coins: state.coins + score, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const nextRound = state.round + 1;
    const done = nextRound > state.maxRounds;
    const newHand = state.deck.slice(state.pos, state.pos + 3);
    return { ...state, hand: newHand, pos: state.pos + 3, round: nextRound, choice: null, lastScore: 0, phase: done ? "gameover" : "decide" };
  }
  return state;
}

export function isTerminal(state: CardFoldThreeState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
