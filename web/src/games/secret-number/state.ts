import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SecretNumberSettings {
  range: "100" | "1000" | "10000";
  lies: "0" | "1" | "2";
}

export type Hint = "higher" | "lower" | "correct";

export interface GuessEntry {
  guess: number;
  hint: Hint;
  wasLie: boolean;
}

export interface SecretNumberState {
  settings: SecretNumberSettings;
  rngSeed: number;
  secret: number;
  range: number;
  maxLies: number;
  liesRemaining: number;
  liesUsed: number;
  maxAttempts: number;
  attempts: number;
  history: GuessEntry[];
  currentGuess: number;
  lastHint: Hint | null;
  gameOver: boolean;
  winner: "player" | null;
}

export type SecretNumberAction =
  | { type: "set-guess"; value: number }
  | { type: "submit" }
  | { type: "restart" };

function maxAttempts(range: number): number {
  // About log2(range) + some buffer + extra for lies
  return Math.ceil(Math.log2(range)) + 5;
}

export function initialState(seed: number, settings: SecretNumberSettings): SecretNumberState {
  const range = parseInt(settings.range, 10);
  const rng = mulberry32(seed);
  const secret = Math.floor(rng() * range) + 1;
  const maxLies = parseInt(settings.lies, 10);

  return {
    settings,
    rngSeed: seed,
    secret,
    range,
    maxLies,
    liesRemaining: maxLies,
    liesUsed: 0,
    maxAttempts: maxAttempts(range) + maxLies * 2,
    attempts: 0,
    history: [],
    currentGuess: Math.ceil(range / 2),
    lastHint: null,
    gameOver: false,
    winner: null,
  };
}

export function reducer(state: SecretNumberState, action: SecretNumberAction): SecretNumberState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (state.gameOver) return state;

  if (action.type === "set-guess") {
    const v = Math.max(1, Math.min(state.range, Math.round(action.value)));
    return { ...state, currentGuess: v };
  }

  if (action.type === "submit") {
    const guess = state.currentGuess;
    const attempts = state.attempts + 1;

    // Determine true hint
    let trueHint: Hint;
    if (guess === state.secret) trueHint = "correct";
    else if (guess < state.secret) trueHint = "higher";
    else trueHint = "lower";

    // Decide if we lie
    const rng = mulberry32(state.rngSeed + attempts * 1000);
    const nextSeed = Math.floor(mulberry32(state.rngSeed)() * 2 ** 31);

    let wasLie = false;
    let displayHint: Hint = trueHint;

    if (trueHint !== "correct" && state.liesRemaining > 0) {
      // Lie with probability 1/(liesRemaining + attempts_left) to spread lies
      const attemptsLeft = state.maxAttempts - attempts;
      const lieProbability = state.liesRemaining / Math.max(1, attemptsLeft + 1);
      if (rng() < lieProbability) {
        wasLie = true;
        displayHint = trueHint === "higher" ? "lower" : "higher";
      }
    }

    const entry: GuessEntry = { guess, hint: displayHint, wasLie };
    const history = [...state.history, entry];

    const won = trueHint === "correct";
    const liesRemaining = state.liesRemaining - (wasLie ? 1 : 0);
    const liesUsed = state.liesUsed + (wasLie ? 1 : 0);
    const outOfAttempts = attempts >= state.maxAttempts && !won;
    const gameOver = won || outOfAttempts;

    return {
      ...state,
      rngSeed: nextSeed,
      attempts,
      history,
      lastHint: displayHint,
      liesRemaining,
      liesUsed,
      winner: won ? "player" : null,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: SecretNumberState): { score: number } | null {
  if (!state.gameOver) return null;
  if (!state.winner) return { score: 0 };
  const base = (state.maxAttempts - state.attempts + 1) * 100;
  return { score: Math.max(0, base) };
}
