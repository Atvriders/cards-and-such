import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VegetablesQuizState, VegetablesQuizAction, VegetablesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VegetablesQuiz } from "./Game.js";

const vegetablesQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof vegetablesQuizPluginSettings>;

export const vegetablesQuizPlugin: GamePlugin<VegetablesQuizState, VegetablesQuizAction, typeof vegetablesQuizPluginSettings> = {
  id: "vegetables-quiz",
  title: "Vegetables Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of vegetables — from root crops to flower heads, global cuisines to botanical facts.",
  howToPlay: `Vegetables Quiz challenges your knowledge of the garden and kitchen. Questions cover vegetable biology, nutritional facts, global origins, historical uses, and surprising scientific details about the crops we eat every day.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions range from spinach and asparagus to ghost peppers and cassava.

Score and accuracy are shown at the end. Whether you grow your own food or just enjoy cooking, Vegetables Quiz will sharpen your garden knowledge!`,
  settings: vegetablesQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as VegetablesQuizSettings),
  reducer, isTerminal, 
  hint: (state: VegetablesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: VegetablesQuiz,
};
