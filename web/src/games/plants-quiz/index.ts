import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PlantsQuizState, PlantsQuizAction, PlantsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PlantsQuiz } from "./Game.js";

const plantsQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type PlantsQuizSettingsType = SettingsOf<typeof plantsQuizSettings>;

export const plantsQuizPlugin: GamePlugin<PlantsQuizState, PlantsQuizAction, typeof plantsQuizSettings> = {
  id: "plants-quiz",
  title: "Plants Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your botany knowledge — photosynthesis, famous plants, plant anatomy, and fascinating flora from around the world.",
  howToPlay: `Plants Quiz challenges your knowledge of the plant kingdom. Questions cover plant biology, anatomy, famous species, botanical records, and the many ways plants support life on Earth — from the smallest moss to the tallest redwood.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Answer quickly to maximize your score.

Click a choice to select it, then press Submit. After answering, the correct option highlights green and any wrong selection turns red. Press Next to continue to the next question.

Use Settings to choose 10, 20, or 30 questions drawn randomly from a curated pool of 30 plant science questions.

Your final score and accuracy are displayed at the end. From casual nature lovers to trained botanists, Plants Quiz grows your green knowledge one question at a time!`,
  settings: plantsQuizSettings,
  initialState: (seed: number, settings: PlantsQuizSettingsType) => initialState(seed, settings as PlantsQuizSettings),
  reducer,
  isTerminal,
  hint: (state: PlantsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PlantsQuiz,
};
