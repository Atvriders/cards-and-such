import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PhilosophersQuizState, PhilosophersQuizAction, PhilosophersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PhilosophersQuiz } from "./Game.js";

const philosophersQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof philosophersQuizPluginSettings>;

export const philosophersQuizPlugin: GamePlugin<PhilosophersQuizState, PhilosophersQuizAction, typeof philosophersQuizPluginSettings> = {
  id: "philosophers-quiz",
  title: "Philosophers Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of history's greatest thinkers — from Socrates and Plato to Kant, Nietzsche, and Sartre.",
  howToPlay: `Philosophers Quiz challenges your knowledge of the thinkers who shaped human civilization. Questions cover ancient Greek philosophy, Enlightenment ideas, existentialism, Eastern philosophy, key philosophical works and their authors, and the core concepts that define each school of thought.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions cover thinkers from Confucius and Socrates to Simone de Beauvoir and Albert Camus.

Score and accuracy are displayed at the end. Whether you love debating big ideas or just started exploring philosophy, this quiz will make you think!`,
  settings: philosophersQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as PhilosophersQuizSettings),
  reducer, isTerminal, component: PhilosophersQuiz,
};
