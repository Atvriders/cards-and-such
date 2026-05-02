import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FruitsQuizState, FruitsQuizAction, FruitsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FruitsQuiz } from "./Game.js";

const fruitsQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof fruitsQuizPluginSettings>;

export const fruitsQuizPlugin: GamePlugin<FruitsQuizState, FruitsQuizAction, typeof fruitsQuizPluginSettings> = {
  id: "fruits-quiz",
  title: "Fruits Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of fruits — from tropical exotics to botanical classifications and world records.",
  howToPlay: `Fruits Quiz challenges your knowledge of the world of fruit. Questions cover botanical classifications, famous records, fruit biology, global production, flavors, and surprising fruit facts from kitchens and labs around the world.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Fast, accurate answers maximize your final score.

Click a choice to select it, then press Submit. After answering, the correct option highlights green and any wrong selection turns red. Press Next to continue to the next question.

Use Settings to choose 10, 20, or 30 questions. Questions cover tomatoes to durians, cranberries to dragon fruit, and everything in between.

Your final score and accuracy are displayed at the end. Whether you are a foodie or a botanist, Fruits Quiz will refresh your fruity knowledge!`,
  settings: fruitsQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as FruitsQuizSettings),
  reducer, isTerminal, 
  hint: (state: FruitsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: FruitsQuiz,
};
