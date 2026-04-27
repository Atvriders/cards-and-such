import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Suit Stack: 1 game = 8 sequential card draws. After each draw,
// if the suit matches the previous card's suit, +5 to score; otherwise the
// streak resets but no penalty.

export const TOTAL_DRAWS = 8;

export interface SuitStackSettings { dummy: boolean; }

export interface SuitStackState {
  rngSeed: number;
  drawn: number[]; // cards in order
  score: number;
  phase: "drawing" | "done";
  streak: number; // current same-suit streak length (0 means just started)
}

export type SuitStackAction = { type: "draw" };

export function suitOf(c: number): number { return Math.floor(c / 13); }

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _settings: SuitStackSettings): SuitStackState {
  return { rngSeed: seed, drawn: [], score: 0, phase: "drawing", streak: 0 };
}

export function reducer(state: SuitStackState, action: SuitStackAction): SuitStackState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const drawn = [...state.drawn, c];
    let streak = state.streak;
    let scoreAdd = 0;
    if (drawn.length === 1) {
      streak = 1;
    } else {
      const prev = drawn[drawn.length - 2]!;
      if (suitOf(prev) === suitOf(c)) {
        streak = streak + 1;
        scoreAdd = 5;
      } else {
        streak = 1;
      }
    }
    const isLast = drawn.length >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, drawn, score: state.score + scoreAdd, phase: isLast ? "done" : "drawing", streak };
  }
  return state;
}

export function isTerminal(state: SuitStackState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
