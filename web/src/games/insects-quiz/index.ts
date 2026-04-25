import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InsectsQuiz } from "./Game.js";

const insectsQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type InsectsQuizSettingsType = SettingsOf<typeof insectsQuizSettings>;

export const insectsQuizPlugin: GamePlugin<QuizState, QuizAction, typeof insectsQuizSettings> = {
  id: "insects-quiz",
  title: "Insects Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of the insect world — anatomy, behavior, metamorphosis, and fascinating bug facts.",
  howToPlay: `Insects Quiz takes you into the miniature world of the most numerous animals on Earth. Questions cover insect anatomy, life cycles, behavior, record-holders, and ecological roles — from humble ants to spectacular beetles.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Answer quickly to maximize your score.

Click a choice to select it, then press Submit. After answering, the correct option highlights green and wrong selections turn red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions drawn from a pool of 30 insect facts. Topics include metamorphosis stages, social behavior, record-holders, and the fascinating adaptations that make insects the most successful group of animals on the planet.

Your final score and accuracy are displayed at the end. Whether you are a curious student or a dedicated entomologist, Insects Quiz will sharpen your knowledge of nature's most abundant creatures!`,
  settings: insectsQuizSettings,
  initialState: (seed: number, settings: InsectsQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  component: InsectsQuiz,
};
