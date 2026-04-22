import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const CODE_LENGTH = 5;
export const MAX_GUESSES = 8;
export const MAX_HINTS = 3;
export const COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "pink"] as const;
export type CBColor = typeof COLORS[number];
export const NUM_COLORS = COLORS.length;

export interface CBFeedback {
  bulls: number;
  cows: number;
}

export interface CBGuessRecord {
  guess: CBColor[];
  feedback: CBFeedback;
}

export interface CodeBreakerSettings {
  dummy?: string;
}

export interface CodeBreakerState {
  secret: CBColor[];
  guesses: CBGuessRecord[];
  currentGuess: (CBColor | null)[];
  selectedPos: number | null;
  winner: "player" | "house" | null;
  score: number;
  rngSeed: number;
  settings: CodeBreakerSettings;
  hintsLeft: number;
  /** Which positions have been revealed by hints */
  revealed: boolean[];
}

export type CodeBreakerAction =
  | { type: "setColor"; pos: number; color: CBColor }
  | { type: "selectPos"; pos: number | null }
  | { type: "submit" }
  | { type: "useHint" }
  | { type: "clear" };

function generateSecret(rng: () => number): CBColor[] {
  const secret: CBColor[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    secret.push(COLORS[Math.floor(rng() * NUM_COLORS)]!);
  }
  return secret;
}

export function computeFeedback(secret: CBColor[], guess: CBColor[]): CBFeedback {
  let bulls = 0;
  let cows = 0;
  const secretCounts: Record<string, number> = {};
  const guessCounts: Record<string, number> = {};

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else {
      secretCounts[secret[i]!] = (secretCounts[secret[i]!] ?? 0) + 1;
      guessCounts[guess[i]!] = (guessCounts[guess[i]!] ?? 0) + 1;
    }
  }
  for (const color of Object.keys(guessCounts)) {
    cows += Math.min(guessCounts[color]!, secretCounts[color] ?? 0);
  }
  return { bulls, cows };
}

export function initialState(seed: number, settings: CodeBreakerSettings): CodeBreakerState {
  const rng = mulberry32(seed);
  const secret = generateSecret(rng);
  return {
    secret,
    guesses: [],
    currentGuess: new Array<CBColor | null>(CODE_LENGTH).fill(null),
    selectedPos: null,
    winner: null,
    score: 0,
    rngSeed: seed,
    settings,
    hintsLeft: MAX_HINTS,
    revealed: new Array<boolean>(CODE_LENGTH).fill(false),
  };
}

export function reducer(state: CodeBreakerState, action: CodeBreakerAction): CodeBreakerState {
  if (state.winner !== null) return state;

  if (action.type === "selectPos") {
    return { ...state, selectedPos: action.pos };
  }

  if (action.type === "setColor") {
    const { pos, color } = action;
    if (pos < 0 || pos >= CODE_LENGTH) return state;
    const next = [...state.currentGuess] as (CBColor | null)[];
    next[pos] = color;
    const nextPos = pos < CODE_LENGTH - 1 ? pos + 1 : null;
    return { ...state, currentGuess: next, selectedPos: nextPos };
  }

  if (action.type === "clear") {
    return {
      ...state,
      currentGuess: new Array<CBColor | null>(CODE_LENGTH).fill(null),
      selectedPos: null,
    };
  }

  if (action.type === "useHint") {
    if (state.hintsLeft <= 0) return state;
    // Find first unrevealed position
    const pos = state.revealed.findIndex((r) => !r);
    if (pos < 0) return state;
    const nextRevealed = [...state.revealed];
    nextRevealed[pos] = true;
    const nextGuess = [...state.currentGuess] as (CBColor | null)[];
    nextGuess[pos] = state.secret[pos]!;
    return {
      ...state,
      hintsLeft: state.hintsLeft - 1,
      revealed: nextRevealed,
      currentGuess: nextGuess,
    };
  }

  if (action.type === "submit") {
    if (state.currentGuess.some((c) => c === null)) return state;
    const guess = state.currentGuess as CBColor[];
    const feedback = computeFeedback(state.secret, guess);
    const newGuesses: CBGuessRecord[] = [...state.guesses, { guess: [...guess], feedback }];
    const guessesUsed = newGuesses.length;

    if (feedback.bulls === CODE_LENGTH) {
      const hintsUsed = MAX_HINTS - state.hintsLeft;
      const score = Math.max(0, (MAX_GUESSES + 1 - guessesUsed) * 100 - hintsUsed * 50);
      return { ...state, guesses: newGuesses, winner: "player", score };
    }
    if (guessesUsed >= MAX_GUESSES) {
      return { ...state, guesses: newGuesses, winner: "house", score: 0 };
    }
    // Clear non-revealed positions for next guess
    const nextGuess = state.revealed.map((r, i) => (r ? state.secret[i]! : null)) as (CBColor | null)[];
    return { ...state, guesses: newGuesses, currentGuess: nextGuess, selectedPos: null };
  }

  return state;
}

export function isTerminal(state: CodeBreakerState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.score };
}
