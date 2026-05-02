import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AsianCuisineQuizState, AsianCuisineQuizAction, AsianCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AsianCuisineQuiz } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const asianCuisineQuizPlugin: GamePlugin<AsianCuisineQuizState, AsianCuisineQuizAction, typeof settings> = {
  id: "asian-cuisine-quiz", title: "Asian Cuisine Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of iconic dishes, ingredients, and cooking styles from across Asia.",
  howToPlay: `Asian Cuisine Quiz challenges you to identify dishes, ingredients, and culinary traditions from across Asia. Questions span Japanese, Chinese, Thai, Korean, Vietnamese, Indian, and Southeast Asian cuisines.

Each question presents four possible answers. Select the one you believe is correct — green means right, red means wrong, and the correct answer is always revealed after your selection.

Earn 10 points for each correct answer. Choose 5, 10, or 15 questions in Settings to control the length of your session. The question pool is shuffled each game so every session feels fresh.

Tips: Many Asian soups share broth bases — look for regional clues in the question. Japanese cuisine often ferments or preserves key ingredients. Thai dishes frequently combine sour, sweet, and spicy flavors. Korean cuisine is known for fermented condiments.

Challenge yourself to name countries, identify signature spices, and distinguish between similar-sounding dishes across this richly diverse region.`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as AsianCuisineQuizSettings),
  reducer, isTerminal, 
  hint: (state: AsianCuisineQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: AsianCuisineQuiz,
};
