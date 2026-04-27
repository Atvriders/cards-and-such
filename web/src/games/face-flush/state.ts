import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Face Flush: 8 rounds. Deal 5 cards. Count face cards (J/Q/K). Each face card scores 10. All 5 face = bonus +50.

export const TOTAL_ROUNDS = 8;

export interface FaceFlushSettings { dummy: boolean; }

export interface FaceFlushState {
  rngSeed: number;
  round: number;
  hand: number[];
  faceCount: number;
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
  bonus: boolean;
}

export type FaceFlushAction = { type: "deal" } | { type: "next" };

export function isFace(c: number): boolean { const r = c % 13; return r >= 9 && r <= 11; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal5(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: FaceFlushSettings): FaceFlushState {
  return { rngSeed: seed, round: 1, hand: [], faceCount: 0, score: 0, phase: "dealing", lastPts: 0, bonus: false };
}

export function reducer(state: FaceFlushState, action: FaceFlushAction): FaceFlushState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const faceCount = hand.filter(isFace).length;
    const bonus = faceCount === 5;
    let pts = faceCount * 10;
    if (bonus) pts += 50;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, faceCount, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts, bonus };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], faceCount: 0, phase: "dealing", lastPts: 0, bonus: false };
  }
  return state;
}

export function isTerminal(state: FaceFlushState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
