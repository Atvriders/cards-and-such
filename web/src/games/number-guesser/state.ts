import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NumberGuesserSettings {
  range: "100" | "1000" | "10000";
  maxAttempts: "5" | "7" | "10" | "14";
}

export type Hint = "higher" | "lower" | "correct";

export interface GuessEntry {
  guess: number;
  hint: Hint;
}

export interface NumberGuesserState {
  settings: NumberGuesserSettings;
  rngSeed: number;
  secret: number;
  range: number;
  maxAttempts: number;
  attempts: number;
  history: GuessEntry[];
  currentGuess: number;
  hint: Hint | null;
  winner: "player" | null;
  gameOver: boolean;
}

export type NumberGuesserAction =
  | { type: "set-guess"; value: number }
  | { type: "submit" };

export function initialState(seed: number, settings: NumberGuesserSettings): NumberGuesserState {
  const range = parseInt(settings.range, 10);
  const maxAttempts = parseInt(settings.maxAttempts, 10);
  const rng = mulberry32(seed);
  const secret = Math.floor(rng() * range) + 1;
  return {
    settings,
    rngSeed: seed,
    secret,
    range,
    maxAttempts,
    attempts: 0,
    history: [],
    currentGuess: Math.ceil(range / 2),
    hint: null,
    winner: null,
    gameOver: false,
  };
}

export function reducer(state: NumberGuesserState, action: NumberGuesserAction): NumberGuesserState {
  if (state.gameOver) return state;

  if (action.type === "set-guess") {
    const clamped = Math.max(1, Math.min(state.range, Math.round(action.value)));
    return { ...state, currentGuess: clamped };
  }

  if (action.type === "submit") {
    const guess = state.currentGuess;
    const attempts = state.attempts + 1;
    let hint: Hint;
    if (guess === state.secret) hint = "correct";
    else if (guess < state.secret) hint = "higher";
    else hint = "lower";

    const entry: GuessEntry = { guess, hint };
    const history = [...state.history, entry];

    const won = hint === "correct";
    const outOfAttempts = attempts >= state.maxAttempts && !won;
    const gameOver = won || outOfAttempts;

    return {
      ...state,
      attempts,
      history,
      hint,
      winner: won ? "player" : null,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: NumberGuesserState): { score: number } | null {
  if (!state.gameOver) return null;
  if (!state.winner) return { score: 0 };
  const score = (state.maxAttempts - state.attempts + 1) * 100;
  return { score: Math.max(0, score) };
}
