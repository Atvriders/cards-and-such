import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MoviesTrivia } from "./Game.js";

const moviesTriviaSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type MoviesTriviaSettingsType = SettingsOf<typeof moviesTriviaSettings>;

export const moviesTriviaPlugin: GamePlugin<QuizState, QuizAction, typeof moviesTriviaSettings> = {
  id: "movies-trivia",
  title: "Movies Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of cinema — directors, actors, iconic quotes, Oscar winners, and classic films from every era.",
  howToPlay: `Movies Trivia challenges your knowledge of cinema across all eras — from classic Hollywood to modern blockbusters. Each question presents four multiple-choice answers covering directors, actors, Academy Award winners, memorable quotes, and film history.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points for every second remaining on the clock. Answering in 3 seconds earns 100 + 120 = 220 points, while waiting until the last second earns only 100 + 10 = 110. Wrong answers score zero.

Click a choice to highlight it, then press Submit (or let the timer run out). After submitting you'll see which answer was correct highlighted in green, and any wrong pick highlighted in red. Click Next to continue to the next question.

Choose how many questions to answer in the Settings panel — 10 for a quick session, 20 for a standard game, or 30 for the full challenge. Questions are drawn at random from a bank of 32 carefully curated cinema facts spanning over a century of film history.

At the end you see your total score and how many questions you answered correctly. Aim to be both knowledgeable and fast — the biggest scores belong to cinephiles who know their films and buzz in early.`,
  settings: moviesTriviaSettings,
  initialState: (seed: number, settings: MoviesTriviaSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-movies-trivia-answer-0"]', pulses: 3 } : null,component: MoviesTrivia,
};
