import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RiversQuiz } from "./Game.js";

const riversQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type RiversQuizSettingsType = SettingsOf<typeof riversQuizSettings>;

export const riversQuizPlugin: GamePlugin<QuizState, QuizAction, typeof riversQuizSettings> = {
  id: "rivers-quiz",
  title: "Rivers Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Follow the flow of world rivers — geography, ecology, records, and the rivers that shaped civilizations.",
  howToPlay: `Rivers Quiz flows through the world's great waterways — from the Nile and the Amazon to the Yangtze and the Volga. Questions cover geography, river features, ecological importance, records, and the rivers that shaped the rise and fall of civilizations.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 bonus points per second remaining — so think fast!

Click a choice to select it, then press Submit. After answering, correct options turn green and wrong choices turn red. Press Next to advance to the next question.

Use Settings to choose 10, 20, or 30 questions from a 30-question pool. Topics include deltas, meanders, floodplains, tributaries, watersheds, the water cycle, and famous rivers on every continent.

Your final score and accuracy are displayed at the end. From geography enthusiasts to students, Rivers Quiz is a flowing journey through the arteries of our planet!`,
  settings: riversQuizSettings,
  initialState: (seed: number, settings: RiversQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: RiversQuiz,
};
