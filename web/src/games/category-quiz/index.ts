import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CategoryQuizState, CategoryQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CategoryQuiz } from "./CategoryQuiz.js";

export const categoryQuizSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

type CategoryQuizSettingsType = SettingsOf<typeof categoryQuizSettings>;

export const categoryQuizPlugin: GamePlugin<CategoryQuizState, CategoryQuizAction, typeof categoryQuizSettings> = {
  id: "category-quiz",
  title: "Category Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Answer multiple-choice trivia questions drawn from rotating categories.",
  howToPlay: `Category Quiz presents multiple-choice trivia questions from six rotating categories: Science, History, Geography, Language, Math, and Pop Culture. Questions are shuffled each game so no two playthroughs are the same.

Each question shows a prompt and four answer options. Click the option you believe is correct, then press Confirm to lock in your answer. You will immediately see whether you were right or wrong, and the correct answer is highlighted in green. Press Next to advance to the following question.

Correct answers earn 10 points each. There is no penalty for wrong answers, so always make a guess if you are unsure. Your total score out of the maximum possible is shown at the end.

Settings let you choose 10, 15, or 20 questions per game. Longer sessions pull from a wider variety of categories.

Tips: For science and geography questions, eliminate obviously wrong options first to narrow your choices. For language questions, think about roots and word families. Math questions can often be solved by estimation. For history, try to remember approximate decades if not exact years — this alone can eliminate two wrong answers.`,
  settings: categoryQuizSettings,
  initialState: (seed: number, settings: CategoryQuizSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CategoryQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: CategoryQuiz,
};
