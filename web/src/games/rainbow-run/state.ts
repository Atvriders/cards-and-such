import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Rainbow Run: Draw 12 cards. Track a running streak of suits. Each time you've covered
// all 4 suits in any window (track unique suits seen since last completion), you score 10 points
// and the tracker resets. Encourages collecting all four suits as quickly as possible.

export const TOTAL_DRAWS = 12;

export interface RainbowRunSettings { dummy: boolean; }

export interface RainbowRunState {
  rngSeed: number;
  drawn: number;
  history: number[]; // cards drawn so far
  suitsSeen: boolean[]; // length 4
  rainbows: number;
  score: number;
  lastCard: number | null;
  phase: "drawing" | "done";
}

export type RainbowRunAction = { type: "draw" };

export function suitOf(c: number): number { return Math.floor(c / 13); }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = suitOf(c); return s === 1 || s === 2; }

export function initialState(seed: number, _settings: RainbowRunSettings): RainbowRunState {
  return { rngSeed: seed, drawn: 0, history: [], suitsSeen: [false, false, false, false], rainbows: 0, score: 0, lastCard: null, phase: "drawing" };
}

export function reducer(state: RainbowRunState, action: RainbowRunAction): RainbowRunState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const s = suitOf(c);
    let suits = [...state.suitsSeen];
    suits[s] = true;
    let rainbows = state.rainbows;
    let score = state.score;
    if (suits.every(v => v)) {
      rainbows += 1;
      score += 10;
      suits = [false, false, false, false];
    }
    const drawn = state.drawn + 1;
    const phase = drawn >= TOTAL_DRAWS ? "done" : "drawing";
    return { ...state, rngSeed: nextSeed, drawn, history: [...state.history, c], suitsSeen: suits, rainbows, score, lastCard: c, phase };
  }
  return state;
}

export function isTerminal(state: RainbowRunState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
