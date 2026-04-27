import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Stack Stress: stack 8 cards in increasing rank. Each draw shows a card; you
// either Stack (if it's >= the top of stack) or Pass. Pass = no penalty but moves on.
// Wrong stack = restart the stack. 5 attempts total, score on best run.

export const STACK_TARGET = 8;
export const ATTEMPTS = 5;

export interface CardStackStressSettings { dummy: boolean; }

export interface CardStackStressState {
  rngSeed: number;
  attempt: number;
  stack: number[];
  current: number | null;
  bestStack: number;
  attemptsLeft: number;
  score: number;
  phase: "playing" | "won" | "lost" | "done";
}

export type CardStackStressAction =
  | { type: "draw" }
  | { type: "stack" }
  | { type: "pass" }
  | { type: "next" };

export function rankOf(c: number): number { return c % 13; } // 0..12 (2..A)
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _s: CardStackStressSettings): CardStackStressState {
  return {
    rngSeed: seed,
    attempt: 1,
    stack: [],
    current: null,
    bestStack: 0,
    attemptsLeft: ATTEMPTS,
    score: 0,
    phase: "playing",
  };
}

export function reducer(state: CardStackStressState, action: CardStackStressAction): CardStackStressState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "playing") return state;
    if (state.current !== null) return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, current: c };
  }
  if (action.type === "stack") {
    if (state.phase !== "playing" || state.current === null) return state;
    const top = state.stack.length === 0 ? -1 : rankOf(state.stack[state.stack.length - 1]!);
    const ok = rankOf(state.current) >= top;
    if (!ok) {
      // wrong stack: end attempt
      const best = Math.max(state.bestStack, state.stack.length);
      const usedAttempts = state.attempt;
      const attemptsLeft = ATTEMPTS - usedAttempts;
      if (attemptsLeft <= 0) {
        return { ...state, current: null, stack: [], bestStack: best, attemptsLeft: 0, score: best * 20, phase: "done" };
      }
      return { ...state, current: null, stack: [], bestStack: best, attemptsLeft, attempt: state.attempt + 1, phase: "lost" };
    }
    const newStack = [...state.stack, state.current];
    if (newStack.length >= STACK_TARGET) {
      const best = Math.max(state.bestStack, newStack.length);
      return { ...state, current: null, stack: newStack, bestStack: best, score: best * 20 + 100, phase: "won" };
    }
    return { ...state, current: null, stack: newStack };
  }
  if (action.type === "pass") {
    if (state.phase !== "playing") return state;
    return { ...state, current: null };
  }
  if (action.type === "next") {
    if (state.phase !== "lost" && state.phase !== "won") return state;
    if (state.attemptsLeft <= 0 || state.phase === "won") {
      return { ...state, phase: "done" };
    }
    return { ...state, phase: "playing", stack: [], current: null };
  }
  return state;
}

export function isTerminal(state: CardStackStressState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
