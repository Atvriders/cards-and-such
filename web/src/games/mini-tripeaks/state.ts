import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const DECK_SIZE = 30;
export const INITIAL_FLIP = 18;
export const MAX_CLICKS = 30;

export interface MiniTripeaksSettings { dummy: boolean; }

export interface MiniTripeaksState {
  rngSeed: number;
  layout: number[]; // current visible card ids (0..51)
  removed: number;
  clicks: number;
  score: number;
  phase: "playing" | "done";
}

export type MiniTripeaksAction = { type: "remove"; index: number } | { type: "noop" };

function shuffleDeck(rng: () => number, n: number): number[] {
  const a: number[] = [];
  for (let i = 0; i < n; i++) a.push(i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function cardName(c: number): string {
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13) % 4]!;
}

export function initialState(seed: number, _settings: MiniTripeaksSettings): MiniTripeaksState {
  const rng = mulberry32(seed);
  const deck = shuffleDeck(rng, DECK_SIZE);
  const layout = deck.slice(0, INITIAL_FLIP);
  return { rngSeed: seed, layout, removed: 0, clicks: 0, score: 0, phase: "playing" };
}

export function reducer(state: MiniTripeaksState, action: MiniTripeaksAction): MiniTripeaksState {
  if (state.phase === "done") return state;
  if (action.type === "remove") {
    if (action.index < 0 || action.index >= state.layout.length) return state;
    const layout = state.layout.filter((_, i) => i !== action.index);
    const removed = state.removed + 1;
    const clicks = state.clicks + 1;
    const score = state.score + 15;
    const done = layout.length === 0 || clicks >= MAX_CLICKS;
    return { ...state, layout, removed, clicks, score, phase: done ? "done" : "playing" };
  }
  return state;
}

export function isTerminal(state: MiniTripeaksState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
