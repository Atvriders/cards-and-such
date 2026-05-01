import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const PAIR_COUNT = 8;
export const TOTAL_CARDS = PAIR_COUNT * 2;
export const SCORE_MATCH = 12;
export const SCORE_PERFECT_BONUS = 30;

export interface ConcentrationCardsSettings { dummy: boolean; }

export interface ConcentrationCardsState {
  rngSeed: number;
  values: number[];
  revealed: boolean[];
  flipped: number[];
  matches: number;
  attempts: number;
  score: number;
  phase: "playing" | "done";
}

export type ConcentrationCardsAction =
  | { type: "flip"; index: number }
  | { type: "resolve" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _s: ConcentrationCardsSettings): ConcentrationCardsState {
  const rng = mulberry32(seed);
  const pairs: number[] = [];
  for (let i = 0; i < PAIR_COUNT; i++) { pairs.push(i, i); }
  const values = shuffle(pairs, rng);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    values,
    revealed: new Array(TOTAL_CARDS).fill(false),
    flipped: [],
    matches: 0,
    attempts: 0,
    score: 0,
    phase: "playing",
  };
}

export function reducer(state: ConcentrationCardsState, action: ConcentrationCardsAction): ConcentrationCardsState {
  if (state.phase === "done") return state;
  if (action.type === "flip") {
    if (state.flipped.length >= 2) return state;
    if (state.revealed[action.index]) return state;
    if (state.flipped.includes(action.index)) return state;
    return { ...state, flipped: [...state.flipped, action.index] };
  }
  if (action.type === "resolve") {
    if (state.flipped.length !== 2) return state;
    const [a, b] = state.flipped;
    const matched = state.values[a!] === state.values[b!];
    const revealed = [...state.revealed];
    let matches = state.matches;
    let score = state.score;
    if (matched) {
      revealed[a!] = true;
      revealed[b!] = true;
      matches++;
      score += SCORE_MATCH;
    }
    const attempts = state.attempts + 1;
    let phase: ConcentrationCardsState["phase"] = "playing";
    if (matches >= PAIR_COUNT) {
      phase = "done";
      if (attempts === PAIR_COUNT) score += SCORE_PERFECT_BONUS;
    }
    return { ...state, revealed, flipped: [], matches, attempts, score, phase };
  }
  return state;
}

export function isTerminal(state: ConcentrationCardsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

export const SYMBOL_FACES = ["A","B","C","D","E","F","G","H"];
