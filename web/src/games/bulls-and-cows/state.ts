import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const MAX_GUESSES = 10;

export interface BullsAndCowsSettings {
  codeLength: "3" | "4" | "5";
  allowRepeats: boolean;
}

export interface GuessRecord {
  guess: number[];
  bulls: number;
  cows: number;
}

export interface BullsAndCowsState {
  secret: number[];
  guesses: GuessRecord[];
  currentGuess: string; // digit string being typed
  winner: "player" | "house" | null;
  score: number;
  rngSeed: number;
  settings: BullsAndCowsSettings;
  codeLength: number;
}

export type BullsAndCowsAction =
  | { type: "typeDigit"; digit: string }
  | { type: "backspace" }
  | { type: "submit" }
  | { type: "clear" };

function generateSecret(rng: () => number, length: number, allowRepeats: boolean): number[] {
  if (allowRepeats) {
    const secret: number[] = [];
    for (let i = 0; i < length; i++) {
      secret.push(Math.floor(rng() * 10));
    }
    return secret;
  }
  // No repeats: sample without replacement from 0-9
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Fisher-Yates partial shuffle
  for (let i = 0; i < length; i++) {
    const j = i + Math.floor(rng() * (digits.length - i));
    [digits[i], digits[j]] = [digits[j]!, digits[i]!];
  }
  return digits.slice(0, length);
}

export function computeFeedback(secret: number[], guess: number[]): { bulls: number; cows: number } {
  let bulls = 0;
  let cows = 0;
  const secretCounts: Record<number, number> = {};
  const guessCounts: Record<number, number> = {};

  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else {
      secretCounts[secret[i]!] = (secretCounts[secret[i]!] ?? 0) + 1;
      guessCounts[guess[i]!] = (guessCounts[guess[i]!] ?? 0) + 1;
    }
  }
  for (const d of Object.keys(guessCounts)) {
    const dk = Number(d);
    cows += Math.min(guessCounts[dk]!, secretCounts[dk] ?? 0);
  }
  return { bulls, cows };
}

export function initialState(seed: number, settings: BullsAndCowsSettings): BullsAndCowsState {
  const rng = mulberry32(seed);
  const codeLength = Number(settings.codeLength);
  const secret = generateSecret(rng, codeLength, settings.allowRepeats);
  return {
    secret,
    guesses: [],
    currentGuess: "",
    winner: null,
    score: 0,
    rngSeed: seed,
    settings,
    codeLength,
  };
}

export function reducer(state: BullsAndCowsState, action: BullsAndCowsAction): BullsAndCowsState {
  if (state.winner !== null) return state;

  if (action.type === "typeDigit") {
    if (state.currentGuess.length >= state.codeLength) return state;
    const d = action.digit;
    if (!/^[0-9]$/.test(d)) return state;
    // Reject duplicate if not allowed
    if (!state.settings.allowRepeats && state.currentGuess.includes(d)) return state;
    return { ...state, currentGuess: state.currentGuess + d };
  }

  if (action.type === "backspace") {
    return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
  }

  if (action.type === "clear") {
    return { ...state, currentGuess: "" };
  }

  if (action.type === "submit") {
    if (state.currentGuess.length !== state.codeLength) return state;
    const guess = state.currentGuess.split("").map(Number);
    const { bulls, cows } = computeFeedback(state.secret, guess);
    const newGuesses: GuessRecord[] = [...state.guesses, { guess, bulls, cows }];
    const guessesUsed = newGuesses.length;

    if (bulls === state.codeLength) {
      const score = Math.max(0, 1100 - guessesUsed * 100);
      return { ...state, guesses: newGuesses, currentGuess: "", winner: "player", score };
    }
    if (guessesUsed >= MAX_GUESSES) {
      return { ...state, guesses: newGuesses, currentGuess: "", winner: "house", score: 0 };
    }
    return { ...state, guesses: newGuesses, currentGuess: "" };
  }

  return state;
}

export function isTerminal(state: BullsAndCowsState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.score };
}
