import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 18;
export const MATCH_SIZE = 3;
export const MATCH_POINTS = 60;
export interface CardTrioQuestSettings { dummy: boolean; }
export interface CardTrioQuestState { rngSeed: number; drawIdx: number; rankCounts: number[]; matches: number; score: number; phase: "playing" | "done"; lastCard: number | null; lastMatched: boolean; }
export type CardTrioQuestAction = { type: "draw" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function initialState(seed: number, _s: CardTrioQuestSettings): CardTrioQuestState {
  return { rngSeed: seed, drawIdx: 0, rankCounts: new Array(13).fill(0), matches: 0, score: 0, phase: "playing", lastCard: null, lastMatched: false };
}
export function reducer(state: CardTrioQuestState, action: CardTrioQuestAction): CardTrioQuestState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng()*52);
    const nextSeed = Math.floor(rng()*2**31);
    const rank = c % 13;
    const counts = [...state.rankCounts];
    counts[rank]!++;
    let matches = state.matches;
    let pts = 0;
    let matched = false;
    if (counts[rank]! === MATCH_SIZE) {
      matches++;
      pts = MATCH_POINTS;
      counts[rank] = 0; // reset that rank
      matched = true;
    }
    const drawIdx = state.drawIdx + 1;
    const phase = drawIdx >= TOTAL_DRAWS ? "done" : "playing";
    return { ...state, rngSeed: nextSeed, drawIdx, rankCounts: counts, matches, score: state.score + pts, phase, lastCard: c, lastMatched: matched };
  }
  return state;
}
export function isTerminal(s: CardTrioQuestState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
