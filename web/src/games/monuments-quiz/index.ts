import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonumentsQuiz } from "./Game.js";

const monumentsQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type MonumentsQuizSettingsType = SettingsOf<typeof monumentsQuizSettings>;

export const monumentsQuizPlugin: GamePlugin<QuizState, QuizAction, typeof monumentsQuizSettings> = {
  id: "monuments-quiz",
  title: "Monuments Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tour the world's most iconic monuments and wonders — history, location, and fascinating facts.",
  howToPlay: `Monuments Quiz takes you on a journey to humanity's greatest architectural and historical achievements. Questions cover ancient wonders, modern landmarks, their locations, construction history, cultural significance, and the fascinating stories behind them.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 bonus points for every second remaining on the clock — quicker correct answers mean a bigger score!

Click a choice to select it, then press Submit. After answering, the correct option highlights green and wrong choices turn red. Press Next to continue your world tour.

Use Settings to choose 10, 20, or 30 questions from a pool of 30 monument facts. Destinations include the Eiffel Tower, Colosseum, Taj Mahal, Stonehenge, Machu Picchu, Angkor Wat, and many more.

Your final score and accuracy are shown at the end. History buffs, travelers, and trivia fans alike will love this monument-hopping adventure around the globe!`,
  settings: monumentsQuizSettings,
  initialState: (seed: number, settings: MonumentsQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MonumentsQuiz,
};
