import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JapaneseCuisineQuizState, JapaneseCuisineQuizAction, JapaneseCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JapaneseCuisineQuiz } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const japaneseCuisineQuizPlugin: GamePlugin<JapaneseCuisineQuizState, JapaneseCuisineQuizAction, typeof settings> = {
  id: "japanese-cuisine-quiz", title: "Japanese Cuisine Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of sushi, ramen, tempura, and the art of Japanese culinary culture.",
  howToPlay: `Japanese Cuisine Quiz tests your knowledge of dishes, ingredients, and culinary traditions. Each question offers four possible answers — tap the correct one to earn 10 points.

After answering, the correct choice is highlighted in green. Wrong answers are marked red. Press Next to continue.

Play 5, 10, or 15 questions per session — choose in Settings. Questions are shuffled each game.

Tips: Pay attention to regional clues in each question. Many dishes are strongly tied to a specific city or region within a country. Look for ingredient keywords that narrow down your choices.

Challenge yourself across multiple sessions to improve your score and deepen your knowledge of this rich culinary tradition!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as JapaneseCuisineQuizSettings),
  reducer, isTerminal, component: JapaneseCuisineQuiz,
};
