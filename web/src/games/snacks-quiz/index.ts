import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnacksQuizState, SnacksQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnacksQuiz } from "./SnacksQuiz.js";

export const snacksQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof snacksQuizSettings>;

export const snacksQuizPlugin: GamePlugin<SnacksQuizState, SnacksQuizAction, typeof snacksQuizSettings> = {
  id: "snacks-quiz",
  title: "Snacks Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of popular snack foods from around the world.",
  howToPlay: `Snacks Quiz tests your knowledge of the world's most beloved snack foods. Each question presents a fact about a snack — its origin, main ingredient, or cultural significance — and you choose the correct answer from four options. After selecting, the correct choice lights up green; a wrong pick turns red while the right answer is revealed. Each correct answer earns 10 points. Choose 5, 10, or 15 questions in settings. Topics include potato chips, pretzels, popcorn, hummus, guacamole, Pocky, churros, and many more global favorites. Tips: Think about the country most associated with each snack — pretzels are German, Pocky is Japanese, nachos are Mexican. When unsure about ingredients, eliminate answers that belong to a completely different food category.`,
  settings: snacksQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SnacksQuiz,
};
