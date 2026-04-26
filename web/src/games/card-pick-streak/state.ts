import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardPickStreakSettings { rounds: "10" | "20"; }

export interface CardPickStreakState {
  deck: number[];
  pos: number;
  options: [number, number];
  chosen: number | null;
  streak: number;
  bestStreak: number;
  score: number;
  round: number;
  maxRounds: number;
  phase: "picking" | "revealed" | "gameover";
  lastCorrect: boolean | null;
}

export type CardPickStreakAction =
  | { type: "pick"; index: 0 | 1 }
  | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

function makeOptions(deck: number[], pos: number): [number, number] {
  const a = deck[pos % deck.length]!;
  const b = deck[(pos + 1) % deck.length]!;
  return [a, b];
}

export function initialState(seed: number, settings: CardPickStreakSettings): CardPickStreakState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  const options = makeOptions(deck, 0);
  return { deck, pos: 0, options, chosen: null, streak: 0, bestStreak: 0, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "picking", lastCorrect: null };
}

export function reducer(state: CardPickStreakState, action: CardPickStreakAction): CardPickStreakState {
  if (state.phase === "gameover") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    const [a, b] = state.options;
    const rankA = a % 13;
    const rankB = b % 13;
    // Player picks the higher card; index 0=a, 1=b
    const higherIdx = rankA >= rankB ? 0 : 1;
    const correct = action.index === higherIdx;
    const newStreak = correct ? state.streak + 1 : 0;
    const pts = correct ? (newStreak >= 3 ? 5 : 2) : 0;
    const done = state.round >= state.maxRounds;
    return { ...state, chosen: action.index, streak: newStreak, bestStreak: Math.max(state.bestStreak, newStreak), score: state.score + pts, phase: done ? "gameover" : "revealed", lastCorrect: correct };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    const newPos = state.pos + 2;
    const options = makeOptions(state.deck, newPos);
    return { ...state, pos: newPos, options, chosen: null, round: state.round + 1, phase: "picking", lastCorrect: null };
  }
  return state;
}

export function isTerminal(state: CardPickStreakState): { score: number } | null {
  if (state.phase === "gameover") return { score: state.score };
  return null;
}
