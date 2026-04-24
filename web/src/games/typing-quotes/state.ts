import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

const QUOTES: string[] = [
  "The only way to do great work is to love what you do.",
  "In the middle of every difficulty lies opportunity.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Life is what happens when you're busy making other plans.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It is during our darkest moments that we must focus to see the light.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",
  "An unexamined life is not worth living.",
  "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
  "When you reach the end of your rope, tie a knot in it and hang on.",
  "Always remember that you are absolutely unique, just like everyone else.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "You will face many defeats in life, but never let yourself be defeated.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "Never let the fear of striking out keep you from playing the game.",
  "Life is either a daring adventure or nothing at all.",
  "Many of life's failures are people who did not realize how close they were to success when they gave up.",
  "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.",
  "If life were predictable it would cease to be life, and be without flavor.",
];

function pickQuote(seed: number, difficulty: "easy" | "medium" | "hard"): string {
  const rng = mulberry32(seed);
  const pool =
    difficulty === "easy"
      ? QUOTES.slice(0, 7)
      : difficulty === "medium"
        ? QUOTES.slice(0, 14)
        : QUOTES;
  return pool[Math.floor(rng() * pool.length)]!;
}

export interface TypingQuotesState {
  settings: { difficulty: "easy" | "medium" | "hard" };
  quote: string;
  typed: string;
  startTime: number | null;
  endTime: number | null;
  rngSeed: number;
}

export type TypingQuotesAction =
  | { type: "type"; text: string; now: number };

export function initialState(
  seed: number,
  settings: { difficulty: "easy" | "medium" | "hard" },
): TypingQuotesState {
  return {
    settings,
    quote: pickQuote(seed, settings.difficulty),
    typed: "",
    startTime: null,
    endTime: null,
    rngSeed: seed,
  };
}

function calcWpm(quote: string, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const words = quote.trim().split(/\s+/).length;
  return Math.round((words / elapsedSeconds) * 60);
}

function calcAccuracy(typed: string, quote: string): number {
  if (typed.length === 0) return 100;
  let correct = 0;
  const len = Math.min(typed.length, quote.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === quote[i]) correct++;
  }
  return Math.round((correct / typed.length) * 100);
}

export function calcScore(state: TypingQuotesState): number {
  if (!state.startTime || !state.endTime) return 0;
  const elapsed = (state.endTime - state.startTime) / 1000;
  const wpm = calcWpm(state.quote, elapsed);
  const acc = calcAccuracy(state.typed, state.quote);
  return Math.round(wpm * (acc / 100));
}

export function reducer(state: TypingQuotesState, action: TypingQuotesAction): TypingQuotesState {
  if (state.endTime !== null) return state;

  switch (action.type) {
    case "type": {
      const text = action.text.slice(0, state.quote.length);
      const startTime = state.startTime ?? (text.length > 0 ? action.now : null);
      const finished = text === state.quote;
      const endTime = finished ? action.now : null;
      return { ...state, typed: text, startTime, endTime };
    }
    default:
      return state;
  }
}

export function isTerminal(state: TypingQuotesState): { score: number } | null {
  if (state.endTime === null) return null;
  return { score: calcScore(state) };
}
