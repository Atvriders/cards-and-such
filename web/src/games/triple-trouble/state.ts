import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Triple Trouble: 12 draws total. Each draw flips one card. Score +30 each time you complete a triple
// (three of the same rank seen so far in your collection).
export const TOTAL_DRAWS = 12;
export interface TripleTroubleSettings { dummy: boolean; }
export interface TripleTroubleState {
  rngSeed: number;
  draw: number;            // 0..12
  hand: number[];          // accumulated cards (full deck index 0..51)
  rankCounts: number[];    // 13 ranks
  triples: number;
  score: number;
  phase: "drawing" | "scored" | "done";
  lastCard: number | null;
  lastTripleRank: number | null;
}
export type TripleTroubleAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function initialState(seed: number, _settings: TripleTroubleSettings): TripleTroubleState {
  return { rngSeed: seed, draw: 0, hand: [], rankCounts: Array(13).fill(0), triples: 0, score: 0, phase: "drawing", lastCard: null, lastTripleRank: null };
}
export function reducer(state: TripleTroubleState, action: TripleTroubleAction): TripleTroubleState {
  if (state.phase === "done") return state;
  if (action.type === "draw" && state.phase === "drawing") {
    const rng = mulberry32(state.rngSeed);
    let c: number;
    do { c = Math.floor(rng() * 52); } while (state.hand.includes(c));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rank = c % 13;
    const newCounts = [...state.rankCounts];
    newCounts[rank]! += 1;
    let newTriples = state.triples;
    let pts = 0;
    let lastTripleRank: number | null = null;
    if (newCounts[rank]! === 3) { newTriples += 1; pts = 30; lastTripleRank = rank; }
    const drawNum = state.draw + 1;
    const isLast = drawNum >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, draw: drawNum, hand: [...state.hand, c], rankCounts: newCounts, triples: newTriples, score: state.score + pts, phase: isLast ? "done" : "scored", lastCard: c, lastTripleRank };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, phase: "drawing", lastTripleRank: null };
  }
  return state;
}
export function isTerminal(state: TripleTroubleState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
