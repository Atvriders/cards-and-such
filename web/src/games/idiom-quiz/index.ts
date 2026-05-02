import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IdiomQuizState, IdiomQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IdiomQuiz } from "./IdiomQuiz.js";

export const idiomQuizSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type IdiomQuizSettingsType = SettingsOf<typeof idiomQuizSettings>;

export const idiomQuizPlugin: GamePlugin<IdiomQuizState, IdiomQuizAction, typeof idiomQuizSettings> = {
  id: "idiom-quiz",
  title: "Idiom Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match common idioms to their meanings in this four-choice quiz.",
  howToPlay: `Idiom Quiz tests your understanding of everyday English expressions and figures of speech. Each question displays a well-known idiom — a phrase whose meaning is different from the literal words — and you must choose the correct definition from four options.

Click or tap the answer you believe is correct. If you are right, the answer highlights green. If wrong, it turns red and the correct answer is shown in green. Press Next to continue to the following idiom.

Correct answers earn 10 points each. The game ends when all questions have been answered and your total score is displayed.

You can adjust the number of questions to 5, 10, or 15 in the settings menu.

Tips: Idioms often originated from historical activities or trades — "beat around the bush" comes from hunting. Look for clues in the metaphorical relationship between words: "under the weather" implies a bad condition. When stumped, eliminate answers that are too literal or too abstract and trust your gut on the figurative meaning.`,
  settings: idiomQuizSettings,
  initialState: (seed: number, settings: IdiomQuizSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: IdiomQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: IdiomQuiz,
};
