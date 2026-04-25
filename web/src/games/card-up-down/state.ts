import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardUpDownSettings {
  rounds: "10" | "20";
}

export interface CardUpDownState {
  deck: number[];
  pos: number;
  currentCard: number;
  nextCard: number | null;
  round: number;
  maxRounds: number;
  score: number;
  streak: number;
  phase: "guessing" | "reveal" | "gameover";
  lastResult: "correct" | "wrong" | null;
  rngSeed: number;
}

export type CardUpDownAction = { type: "guess"; dir: "up" | "down" } | { type: "next" };

function makeDeck(seed: number): { deck: number[]; nextSeed: number } {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  const rng = mulberry32(seed);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return { deck: arr, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function cardRank(c: number): number { return c % 13; } // 0=2, 12=A
export function cardName(c: number): string {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, settings: CardUpDownSettings): CardUpDownState {
  const { deck, nextSeed } = makeDeck(seed);
  return {
    deck, pos: 0, currentCard: deck[0]!, nextCard: null,
    round: 1, maxRounds: parseInt(settings.rounds, 10),
    score: 0, streak: 0,
    phase: "guessing", lastResult: null, rngSeed: nextSeed,
  };
}

export function reducer(state: CardUpDownState, action: CardUpDownAction): CardUpDownState {
  if (state.phase === "gameover") return state;
  if (action.type === "guess") {
    if (state.phase !== "guessing") return state;
    const nextPos = state.pos + 1;
    if (nextPos >= state.deck.length) return { ...state, phase: "gameover" };
    const next = state.deck[nextPos]!;
    const currentRank = cardRank(state.currentCard);
    const nextRank = cardRank(next);
    let correct: boolean;
    if (nextRank === currentRank) correct = true; // tie counts as correct
    else correct = action.dir === "up" ? nextRank > currentRank : nextRank < currentRank;
    const newStreak = correct ? state.streak + 1 : 0;
    const pts = correct ? 10 + newStreak * 2 : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "reveal";
    return { ...state, nextCard: next, lastResult: correct ? "correct" : "wrong", score: state.score + pts, streak: newStreak, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    const newPos = state.pos + 1;
    return { ...state, pos: newPos, currentCard: state.deck[newPos]!, nextCard: null, round: state.round + 1, phase: "guessing", lastResult: null };
  }
  return state;
}

export function isTerminal(state: CardUpDownState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
