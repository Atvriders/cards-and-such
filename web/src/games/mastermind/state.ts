import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const CODE_LENGTH = 4;
export const NUM_COLORS = 6;
export const MAX_GUESSES = 10;
export const COLORS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export type Color = typeof COLORS[number];

export interface Feedback {
  blacks: number; // correct color + position
  whites: number; // correct color, wrong position
}

export interface GuessRecord {
  guess: Color[];
  feedback: Feedback;
}

export interface MastermindSettings {
  dummy?: string;
}

export interface MastermindState {
  secret: Color[];
  guesses: GuessRecord[];
  currentGuess: Color[];
  winner: "player" | "codemaker" | null; // player = cracked code, codemaker = ran out
  score: number;
  rngSeed: number;
  settings: MastermindSettings;
}

export type MastermindAction =
  | { type: "setColor"; pos: number; color: Color }
  | { type: "submit" }
  | { type: "clear" };

function generateSecret(rng: () => number): Color[] {
  const secret: Color[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    secret.push(COLORS[Math.floor(rng() * NUM_COLORS)]!);
  }
  return secret;
}

export function computeFeedback(secret: Color[], guess: Color[]): Feedback {
  let blacks = 0;
  let whites = 0;
  const secretCounts: Record<string, number> = {};
  const guessCounts: Record<string, number> = {};

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      blacks++;
    } else {
      secretCounts[secret[i]!] = (secretCounts[secret[i]!] ?? 0) + 1;
      guessCounts[guess[i]!] = (guessCounts[guess[i]!] ?? 0) + 1;
    }
  }

  for (const color of Object.keys(guessCounts)) {
    whites += Math.min(guessCounts[color]!, secretCounts[color] ?? 0);
  }

  return { blacks, whites };
}

export function initialState(seed: number, settings: MastermindSettings): MastermindState {
  const rng = mulberry32(seed);
  const secret = generateSecret(rng);
  return {
    secret,
    guesses: [],
    currentGuess: [COLORS[0]!, COLORS[0]!, COLORS[0]!, COLORS[0]!],
    winner: null,
    score: 0,
    rngSeed: seed,
    settings,
  };
}

export function reducer(state: MastermindState, action: MastermindAction): MastermindState {
  if (state.winner !== null) return state;

  if (action.type === "setColor") {
    if (action.pos < 0 || action.pos >= CODE_LENGTH) return state;
    const next = [...state.currentGuess];
    next[action.pos] = action.color;
    return { ...state, currentGuess: next as Color[] };
  }

  if (action.type === "clear") {
    return { ...state, currentGuess: [COLORS[0]!, COLORS[0]!, COLORS[0]!, COLORS[0]!] };
  }

  if (action.type === "submit") {
    const guess = state.currentGuess;
    const feedback = computeFeedback(state.secret, guess);
    const newGuesses: GuessRecord[] = [...state.guesses, { guess: [...guess], feedback }];
    const guessesUsed = newGuesses.length;

    if (feedback.blacks === CODE_LENGTH) {
      // Won!
      const score = (MAX_GUESSES + 1 - guessesUsed) * 100;
      return { ...state, guesses: newGuesses, winner: "player", score };
    }

    if (guessesUsed >= MAX_GUESSES) {
      return { ...state, guesses: newGuesses, winner: "codemaker", score: 0 };
    }

    return { ...state, guesses: newGuesses };
  }

  return state;
}

export function isTerminal(state: MastermindState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.score };
}
