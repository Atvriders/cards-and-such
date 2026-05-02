import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrinksQuizState, DrinksQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrinksQuiz } from "./DrinksQuiz.js";

export const drinksQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof drinksQuizSettings>;

export const drinksQuizPlugin: GamePlugin<DrinksQuizState, DrinksQuizAction, typeof drinksQuizSettings> = {
  id: "drinks-quiz",
  title: "Drinks Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of beverages from around the world — wines, spirits, teas, and more.",
  howToPlay: `Drinks Quiz tests your knowledge of beverages from across the globe. Each question asks about a drink's origin, ingredients, base spirit, or interesting fact. Choose the correct answer from four options.

After selecting, the correct answer turns green. A wrong selection turns red while revealing the correct choice in green. Press Next to continue to the following question.

Each correct answer earns 10 points. Your final score is displayed at the end. Select 5, 10, or 15 questions in the settings panel to control the session length.

The quiz covers alcoholic and non-alcoholic drinks alike — from Champagne and Scotch whisky to green tea and coffee. You will encounter questions about production methods, country of origin, classic cocktail ingredients, and the grains or fruits used in fermentation.

Tips: Whisky types often correspond to their home country — Scotland for Scotch, Ireland for Irish, USA for Bourbon. Cocktails are named after their base spirits, so a Margarita is tequila-based. Tea knowledge focuses on where it is grown and how it is processed.`,
  settings: drinksQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: DrinksQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: DrinksQuiz,
};
