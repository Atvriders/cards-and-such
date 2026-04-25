import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const CODE_DIGITS = 4;
export const DIGIT_MAX = 9;
export const MAX_ATTEMPTS = 8;

export interface SafeAttempt {
  guess: number[];
  /** how many digits are exactly right (correct digit AND position) */
  exact: number;
  /** how many digits are in the code but in wrong position */
  misplaced: number;
}

export interface SafeCrackerSettings {
  digits?: number;
}

export interface SafeCrackerState {
  settings: SafeCrackerSettings;
  secret: number[];
  attempts: SafeAttempt[];
  currentGuess: number[];
  phase: "playing" | "won" | "lost";
  score: number;
  rngSeed: number;
}

export type SafeCrackerAction =
  | { type: "setDigit"; pos: number; digit: number }
  | { type: "submit" }
  | { type: "clear" };

function generateCode(rng: () => number, len: number): number[] {
  return Array.from({ length: len }, () => Math.floor(rng() * (DIGIT_MAX + 1)));
}

export function computeHints(secret: number[], guess: number[]): { exact: number; misplaced: number } {
  let exact = 0;
  const secretLeft: number[] = [];
  const guessLeft: number[] = [];

  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) {
      exact++;
    } else {
      secretLeft.push(secret[i]!);
      guessLeft.push(guess[i]!);
    }
  }

  let misplaced = 0;
  for (const d of guessLeft) {
    const idx = secretLeft.indexOf(d);
    if (idx !== -1) {
      misplaced++;
      secretLeft.splice(idx, 1);
    }
  }

  return { exact, misplaced };
}

export function initialState(seed: number, settings: SafeCrackerSettings): SafeCrackerState {
  const rng = mulberry32(seed);
  const secret = generateCode(rng, CODE_DIGITS);
  return {
    settings,
    secret,
    attempts: [],
    currentGuess: new Array<number>(CODE_DIGITS).fill(0),
    phase: "playing",
    score: 0,
    rngSeed: seed,
  };
}

export function reducer(state: SafeCrackerState, action: SafeCrackerAction): SafeCrackerState {
  if (state.phase !== "playing") return state;

  switch (action.type) {
    case "setDigit": {
      const { pos, digit } = action;
      if (pos < 0 || pos >= CODE_DIGITS || digit < 0 || digit > DIGIT_MAX) return state;
      const next = [...state.currentGuess];
      next[pos] = digit;
      return { ...state, currentGuess: next };
    }
    case "clear":
      return { ...state, currentGuess: new Array<number>(CODE_DIGITS).fill(0) };
    case "submit": {
      const guess = [...state.currentGuess];
      const { exact, misplaced } = computeHints(state.secret, guess);
      const newAttempts: SafeAttempt[] = [...state.attempts, { guess, exact, misplaced }];

      if (exact === CODE_DIGITS) {
        const score = (MAX_ATTEMPTS + 1 - newAttempts.length) * 200;
        return { ...state, attempts: newAttempts, phase: "won", score };
      }

      if (newAttempts.length >= MAX_ATTEMPTS) {
        return { ...state, attempts: newAttempts, phase: "lost", score: 0 };
      }

      return { ...state, attempts: newAttempts };
    }
    default:
      return state;
  }
}

export function isTerminal(state: SafeCrackerState): { score: number } | null {
  if (state.phase === "playing") return null;
  return { score: state.score };
}
