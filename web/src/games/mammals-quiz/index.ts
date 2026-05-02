import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MammalsQuiz } from "./Game.js";

const mammalsQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type MammalsQuizSettingsType = SettingsOf<typeof mammalsQuizSettings>;

export const mammalsQuizPlugin: GamePlugin<QuizState, QuizAction, typeof mammalsQuizSettings> = {
  id: "mammals-quiz",
  title: "Mammals Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of the mammal world — from elephants and whales to bats, primates, and their amazing adaptations.",
  howToPlay: `Mammals Quiz explores the warm-blooded, fur-bearing creatures that dominate every habitat on Earth. Questions cover defining characteristics, record holders, behavior, anatomy, communication, and some of the most surprising adaptations in the animal kingdom.

You have 15 seconds per question. A correct answer earns 100 base points plus 10 bonus points for each second remaining — so faster is better!

Click a choice to select it, then press Submit. After each answer the correct option lights green and wrong choices turn red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions randomly drawn from a pool of 30 curated mammal facts. Topics range from the tiniest shrew to the largest whale, from echolocating bats to egg-laying monotremes.

Your final score and accuracy are shown at the end. Whether you love pets, wildlife documentaries, or biology, Mammals Quiz will challenge and entertain you!`,
  settings: mammalsQuizSettings,
  initialState: (seed: number, settings: MammalsQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MammalsQuiz,
};
