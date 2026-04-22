import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Coin Counter — arithmetic practice.
// Display a collection of coins (pennies=1¢, nickels=5¢, dimes=10¢, quarters=25¢).
// Player types the total value in cents. Timed session.

export interface CoinCounterSettings {
  duration: "60" | "120";
  difficulty: "easy" | "medium" | "hard";
}

export type Coin = "penny" | "nickel" | "dime" | "quarter";

export const COIN_VALUE: Record<Coin, number> = {
  penny: 1,
  nickel: 5,
  dime: 10,
  quarter: 25,
};

export const COIN_EMOJI: Record<Coin, string> = {
  penny: "🟤",
  nickel: "⚫",
  dime: "🔘",
  quarter: "🟡",
};

export interface CoinDisplay {
  coin: Coin;
  count: number;
}

export interface CoinCounterState {
  settings: CoinCounterSettings;
  rngSeed: number;
  coins: readonly CoinDisplay[];
  answer: number;             // correct answer in cents
  userInput: string;          // what player typed so far
  timeLeft: number;           // seconds remaining
  correct: number;
  wrong: number;
  streak: number;
  lastResult: "correct" | "wrong" | null;
  phase: "playing" | "done";
}

export type CoinCounterAction =
  | { type: "input"; value: string }
  | { type: "submit" }
  | { type: "tick" }
  | { type: "next" };

function makePuzzle(rng: () => number, difficulty: CoinCounterSettings["difficulty"]): { coins: CoinDisplay[]; answer: number } {
  const coinTypes: Coin[] = ["penny", "nickel", "dime", "quarter"];
  const maxCoin = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const maxCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 8;
  const numTypes = Math.floor(rng() * maxCoin) + 1;

  const shuffled = [...coinTypes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const coins: CoinDisplay[] = [];
  let answer = 0;
  for (let i = 0; i < numTypes; i++) {
    const coin = shuffled[i]!;
    const count = Math.floor(rng() * maxCount) + 1;
    coins.push({ coin, count });
    answer += COIN_VALUE[coin] * count;
  }

  return { coins, answer };
}

export function initialState(seed: number, settings: CoinCounterSettings): CoinCounterState {
  const rng = mulberry32(seed);
  const { coins, answer } = makePuzzle(rng, settings.difficulty);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    coins,
    answer,
    userInput: "",
    timeLeft: parseInt(settings.duration),
    correct: 0,
    wrong: 0,
    streak: 0,
    lastResult: null,
    phase: "playing",
  };
}

export function reducer(state: CoinCounterState, action: CoinCounterAction): CoinCounterState {
  if (state.phase === "done" && action.type !== "next") return state;

  switch (action.type) {
    case "input": {
      const value = action.value.replace(/[^0-9]/g, "").slice(0, 5);
      return { ...state, userInput: value, lastResult: null };
    }

    case "submit": {
      if (state.phase === "done") return state;
      const guessed = parseInt(state.userInput || "0");
      const isCorrect = guessed === state.answer;
      const rng = mulberry32(state.rngSeed);
      const { coins, answer } = makePuzzle(rng, state.settings.difficulty);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return {
        ...state,
        rngSeed: nextSeed,
        coins,
        answer,
        userInput: "",
        correct: state.correct + (isCorrect ? 1 : 0),
        wrong: state.wrong + (isCorrect ? 0 : 1),
        streak: isCorrect ? state.streak + 1 : 0,
        lastResult: isCorrect ? "correct" : "wrong",
      };
    }

    case "tick": {
      const t = state.timeLeft - 1;
      if (t <= 0) return { ...state, timeLeft: 0, phase: "done" };
      return { ...state, timeLeft: t };
    }

    case "next": {
      // Reset / restart handled externally via new seed
      return state;
    }
  }
}

export function isTerminal(state: CoinCounterState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, state.correct * 10 - state.wrong * 3) };
}
