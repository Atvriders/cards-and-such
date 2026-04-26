import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CocktailsQuizState, CocktailsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CocktailsQuiz } from "./Game.js";

export const cocktailsQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cocktailsQuizSettings>;

export const cocktailsQuizPlugin: GamePlugin<CocktailsQuizState, CocktailsQuizAction, typeof cocktailsQuizSettings> = {
  id: "cocktails-quiz",
  title: "Cocktails Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your cocktail knowledge — ingredients, spirits, and classic recipes from around the world.",
  howToPlay: `Cocktails Quiz tests your knowledge of classic and popular cocktails from around the world. Each question asks about the ingredients, base spirit, or distinguishing feature of a well-known mixed drink.

Choose the correct answer to earn 10 points. Correct choices highlight green; wrong ones show red with the right answer revealed. Press Next to continue.

The quiz covers timeless classics like the Martini, Negroni, and Old Fashioned as well as popular modern drinks like the Aperol Spritz, Cosmopolitan, and Moscow Mule. Both base spirits and key modifiers are tested.

Choose 5, 10, or 15 questions to fit your time. The full 15-question round covers the widest range of cocktail knowledge.

Tips: Base spirit clues are the fastest shortcut — tequila-based cocktails include Margarita and Paloma; rum-based include Mojito and Daiquiri; gin-based include Negroni and Tom Collins. Look for secondary ingredients that are unique: coffee liqueur in a White Russian, ginger beer in a Moscow Mule, champagne in a Mimosa. Muddled herbs usually mean Mojito; egg white foam points to Pisco Sour or whiskey sours. When a question mentions a 'copper mug', Moscow Mule is almost certainly the answer.`,
  settings: cocktailsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CocktailsQuiz,
};
