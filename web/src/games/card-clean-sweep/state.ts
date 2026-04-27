import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Clean Sweep: 4 rounds. Each round deals a 26-card pile (random half-deck).
// Player draws cards one at a time. For each face card (J, Q, K) drawn, score +15.
// For each non-face card, score +1. Sweep all face cards = round bonus +50.

export const TOTAL_ROUNDS = 4;

export interface CardCleanSweepSettings { dummy: boolean; }

export interface CardCleanSweepState {
  rngSeed: number;
  round: number;
  pile: number[];
  drawn: number[];
  faceFound: number;
  totalFaceInRound: number;
  score: number;
  phase: "drawing" | "roundDone" | "done";
}

export type CardCleanSweepAction = { type: "draw" } | { type: "next" };

export function rankOf(c: number): number { return c % 13; }
export function isFace(c: number): boolean { const r = rankOf(c); return r >= 9 && r <= 11; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function dealPile(rng: () => number): number[] {
  const all = Array.from({ length: 52 }, (_, i) => i);
  const shuffled = shuffle(all, rng);
  return shuffled.slice(0, 26);
}

export function initialState(seed: number, _s: CardCleanSweepSettings): CardCleanSweepState {
  const rng = mulberry32(seed);
  const pile = dealPile(rng);
  const totalFace = pile.filter(isFace).length;
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    round: 1,
    pile,
    drawn: [],
    faceFound: 0,
    totalFaceInRound: totalFace,
    score: 0,
    phase: "drawing",
  };
}

export function reducer(state: CardCleanSweepState, action: CardCleanSweepAction): CardCleanSweepState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    if (state.pile.length === 0) return state;
    const c = state.pile[0]!;
    const rest = state.pile.slice(1);
    const isF = isFace(c);
    const newScore = state.score + (isF ? 15 : 1);
    const newFaceFound = state.faceFound + (isF ? 1 : 0);
    if (rest.length === 0) {
      const swept = newFaceFound === state.totalFaceInRound;
      return {
        ...state,
        pile: rest,
        drawn: [...state.drawn, c],
        faceFound: newFaceFound,
        score: newScore + (swept ? 50 : 0),
        phase: "roundDone",
      };
    }
    return { ...state, pile: rest, drawn: [...state.drawn, c], faceFound: newFaceFound, score: newScore };
  }
  if (action.type === "next") {
    if (state.phase !== "roundDone") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const pile = dealPile(rng);
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      round: state.round + 1,
      pile,
      drawn: [],
      faceFound: 0,
      totalFaceInRound: pile.filter(isFace).length,
      phase: "drawing",
    };
  }
  return state;
}

export function isTerminal(state: CardCleanSweepState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
