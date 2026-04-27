import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Quartet Quest: 16 draws total. Score +60 each time you complete a four-of-a-kind.
export const TOTAL_DRAWS = 16;
export interface QuartetQuestSettings { dummy: boolean; }
export interface QuartetQuestState {
  rngSeed: number;
  draw: number;
  hand: number[];
  rankCounts: number[];
  quartets: number;
  score: number;
  phase: "drawing" | "scored" | "done";
  lastCard: number | null;
  lastQuartetRank: number | null;
}
export type QuartetQuestAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function initialState(seed: number, _settings: QuartetQuestSettings): QuartetQuestState {
  return { rngSeed: seed, draw: 0, hand: [], rankCounts: Array(13).fill(0), quartets: 0, score: 0, phase: "drawing", lastCard: null, lastQuartetRank: null };
}
export function reducer(state: QuartetQuestState, action: QuartetQuestAction): QuartetQuestState {
  if (state.phase === "done") return state;
  if (action.type === "draw" && state.phase === "drawing") {
    const rng = mulberry32(state.rngSeed);
    let c: number;
    do { c = Math.floor(rng() * 52); } while (state.hand.includes(c));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rank = c % 13;
    const newCounts = [...state.rankCounts];
    newCounts[rank]! += 1;
    let newQ = state.quartets;
    let pts = 0;
    let lastQuartetRank: number | null = null;
    if (newCounts[rank]! === 4) { newQ += 1; pts = 60; lastQuartetRank = rank; }
    const drawNum = state.draw + 1;
    const isLast = drawNum >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, draw: drawNum, hand: [...state.hand, c], rankCounts: newCounts, quartets: newQ, score: state.score + pts, phase: isLast ? "done" : "scored", lastCard: c, lastQuartetRank };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, phase: "drawing", lastQuartetRank: null };
  }
  return state;
}
export function isTerminal(state: QuartetQuestState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
