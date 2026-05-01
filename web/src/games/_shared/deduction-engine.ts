// Shared deduction-puzzle engine. Used by Codenames, Mastermind family,
// Cryptid, Mysterium, Awkward Guests, Concept, Decrypto, Black Box,
// Bulls & Cows, Jotto, Sleuth, Code-777, 13 Clues, Turing Machine, Lingo,
// Tempel, Spyfall mini, Chameleon, Insider, Clue family, Coup, Skull, etc.
//
// Generic logic puzzle: hidden answer (a few items selected from a pool).
// Player guesses; each guess returns "feedback" (matches, in-position, or
// closeness). After N rounds the answer is revealed.
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DeductionMode =
  | "exact"        // Mastermind: match positions
  | "set"          // Codenames-style: set membership
  | "binary"       // 13 Clues / yes-no questions
  | "ordering";    // arrange in correct order

export interface DeductionConfig {
  mode: DeductionMode;
  /** size of secret answer */
  answerLength: number;
  /** pool size (alphabet) */
  poolSize: number;
  /** allow repeated symbols in answer */
  allowRepeats: boolean;
  /** how many guesses */
  maxGuesses: number;
  /** display labels for symbols */
  symbolLabels: readonly string[];
  /** flavor */
  scenarioLabel: string;
  scenarioEmoji: string;
}

export interface DeductionFeedback {
  /** how many positions were exactly right (Mastermind black pegs) */
  exact: number;
  /** how many right symbol but wrong position (white pegs) */
  partial: number;
  /** matches (set/binary) */
  matches: number;
}

export interface DeductionState {
  rngSeed: number;
  answer: readonly number[];
  guesses: readonly { guess: readonly number[]; fb: DeductionFeedback }[];
  current: readonly number[]; // working guess
  phase: "guess" | "won" | "lost";
}

function makeAnswer(rng: () => number, cfg: DeductionConfig): number[] {
  const out: number[] = [];
  if (cfg.allowRepeats) {
    for (let i = 0; i < cfg.answerLength; i++) out.push(Math.floor(rng() * cfg.poolSize));
  } else {
    const pool = Array.from({ length: cfg.poolSize }, (_, i) => i);
    for (let i = 0; i < cfg.answerLength; i++) {
      const idx = Math.floor(rng() * pool.length);
      out.push(pool[idx]!);
      pool.splice(idx, 1);
    }
  }
  return out;
}

export function deductionInitial(seed: number, cfg: DeductionConfig): DeductionState {
  const rng = mulberry32(seed);
  const answer = makeAnswer(rng, cfg);
  const current: number[] = Array(cfg.answerLength).fill(0);
  return { rngSeed: Math.floor(rng() * 2 ** 31), answer, guesses: [], current, phase: "guess" };
}

export function deductionFeedback(answer: readonly number[], guess: readonly number[]): DeductionFeedback {
  let exact = 0;
  for (let i = 0; i < answer.length; i++) if (answer[i] === guess[i]) exact++;
  // partial: count overlap minus exact (per-symbol min counts)
  const ac: Record<number, number> = {};
  const gc: Record<number, number> = {};
  for (const v of answer) ac[v] = (ac[v] ?? 0) + 1;
  for (const v of guess) gc[v] = (gc[v] ?? 0) + 1;
  let overlap = 0;
  for (const k of Object.keys(ac)) {
    const ki = Number(k);
    overlap += Math.min(ac[ki] ?? 0, gc[ki] ?? 0);
  }
  return { exact, partial: overlap - exact, matches: overlap };
}

export function deductionSetCurrent(state: DeductionState, position: number, value: number): DeductionState {
  if (state.phase !== "guess") return state;
  if (position < 0 || position >= state.current.length) return state;
  const next = state.current.slice();
  next[position] = value;
  return { ...state, current: next };
}

export function deductionSubmit(state: DeductionState, cfg: DeductionConfig): DeductionState {
  if (state.phase !== "guess") return state;
  const fb = deductionFeedback(state.answer, state.current);
  const guesses = [...state.guesses, { guess: state.current, fb }];
  const won = fb.exact === cfg.answerLength;
  const lost = !won && guesses.length >= cfg.maxGuesses;
  return {
    ...state,
    guesses,
    current: state.current.slice(),
    phase: won ? "won" : lost ? "lost" : "guess",
  };
}

export function deductionScore(state: DeductionState, cfg: DeductionConfig): { score: number; won: boolean } | null {
  if (state.phase === "guess") return null;
  const won = state.phase === "won";
  const remaining = cfg.maxGuesses - state.guesses.length;
  const score = won ? 100 + remaining * 20 : 0;
  return { score, won };
}
