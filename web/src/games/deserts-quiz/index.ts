import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DesertsQuiz } from "./Game.js";

const desertsQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type DesertsQuizSettingsType = SettingsOf<typeof desertsQuizSettings>;

export const desertsQuizPlugin: GamePlugin<QuizState, QuizAction, typeof desertsQuizSettings> = {
  id: "deserts-quiz",
  title: "Deserts Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Explore the world's driest places — desert types, adaptations, geography, and surprising facts.",
  howToPlay: `Deserts Quiz ventures into the harshest and most fascinating landscapes on Earth. Questions cover hot and cold deserts, geographic records, plant and animal adaptations, desert phenomena like mirages and haboobs, and the growing challenge of desertification.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 points per second remaining on the clock. Answer quickly to maximize your score!

Click a choice to highlight it, then press Submit. After answering, correct options glow green and wrong choices turn red. Press Next to advance.

Use Settings to pick 10, 20, or 30 questions from a 30-question pool. Topics span the Sahara, Atacama, Gobi, Namib, and Antarctic deserts, as well as clever survival adaptations and desert geology terms.

Your final score and accuracy are shown when the quiz ends. From armchair travelers to geography buffs, Deserts Quiz delivers surprising facts about the world's most extreme dry zones!`,
  settings: desertsQuizSettings,
  initialState: (seed: number, settings: DesertsQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: DesertsQuiz,
};
