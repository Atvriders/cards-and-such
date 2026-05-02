import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FoodQuiz } from "./Game.js";

const foodQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type FoodQuizSettingsType = SettingsOf<typeof foodQuizSettings>;

export const foodQuizPlugin: GamePlugin<QuizState, QuizAction, typeof foodQuizSettings> = {
  id: "food-quiz",
  title: "Food Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Savor the world of cuisine — ingredients, cooking techniques, national dishes, culinary history, and global food culture.",
  howToPlay: `Food Quiz takes you on a culinary world tour, testing your knowledge of ingredients, dishes, cooking techniques, and food culture from across the globe. Questions cover world cuisines, iconic dishes and their origins, cooking science, famous chefs, spices, and the history behind beloved foods.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the clock. Confident, rapid answers earn the most points.

Click your chosen answer to highlight it, then press Submit. After answering, the correct choice is highlighted green and any wrong pick turns red. Press Next to advance to the next culinary challenge.

Choose the session length in Settings — 10 questions for an appetizer, 20 for a main course, or 30 for the full tasting menu. Questions are drawn randomly from a pool of 32 food and cuisine facts from around the world.

Review your final score and accuracy at the end. Whether you're a home cook, a foodie traveler, or a professional chef, Food Quiz will challenge your palate of knowledge!`,
  settings: foodQuizSettings,
  initialState: (seed: number, settings: FoodQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: FoodQuiz,
};
