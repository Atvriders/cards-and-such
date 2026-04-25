import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FishQuiz } from "./Game.js";

const fishQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type FishQuizSettingsType = SettingsOf<typeof fishQuizSettings>;

export const fishQuizPlugin: GamePlugin<QuizState, QuizAction, typeof fishQuizSettings> = {
  id: "fish-quiz",
  title: "Fish Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dive into the watery world of fish — from gills and swim bladders to migrations and record-breakers.",
  howToPlay: `Fish Quiz plunges you into the incredible diversity of aquatic life. Questions span anatomy, behavior, adaptations, record-holders, and ecology — covering freshwater and saltwater species from tiny pygmies to massive whale sharks.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 points for every second remaining on the clock — so speed matters!

Click a choice to highlight it, then press Submit to lock in your answer. After answering, correct options glow green and wrong choices turn red. Press Next to advance.

Use the Settings panel to choose 10, 20, or 30 questions from a 30-question pool. Topics include fish anatomy (gills, lateral line, swim bladder), famous species, migration patterns, record holders, and unusual adaptations like bioluminescence and electric organs.

Your final score and accuracy percentage are shown at the end. From casual nature lovers to marine biology enthusiasts, Fish Quiz is a refreshing dive into one of Earth's most diverse animal groups!`,
  settings: fishQuizSettings,
  initialState: (seed: number, settings: FishQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  component: FishQuiz,
};
