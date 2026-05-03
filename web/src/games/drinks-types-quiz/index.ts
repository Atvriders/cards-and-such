import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrinksTypesQuizState, DrinksTypesQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DrinksTypesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DrinksTypesQuiz as unknown as React.ComponentType<unknown> })));
export const drinksTypesQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof drinksTypesQuizSettings>;

export const drinksTypesQuizPlugin: GamePlugin<DrinksTypesQuizState, DrinksTypesQuizAction, typeof drinksTypesQuizSettings> = {
  id: "drinks-types-quiz",
  title: "Drinks Types Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of alcoholic and non-alcoholic beverages from around the world.",
  howToPlay: `Drinks Types Quiz covers the wide world of beverages — spirits, beers, wines, teas, coffees, and traditional drinks from many cultures. Each question describes a drink by its ingredients, production method, or origin and asks you to identify it.

Pick the correct answer to earn 10 points. Green means correct; red reveals where you went wrong. Press Next after each question.

The quiz spans alcoholic drinks like tequila, sake, and sherry, as well as non-alcoholic options like kombucha, yerba mate, and barley tea. Regional clues frequently appear — listen for countries, production techniques, or flavor descriptions.

Choose 5, 10, or 15 questions. The full 15-question round tests the broadest range of drink knowledge.

Tips: Production method clues are strong hints — distillation points to spirits; fermentation without distillation points to beer, wine, or cider. Geographic clues like 'Japan' immediately suggest sake; 'agave plant' means tequila or mezcal. Taste descriptors matter too: ginger and spicy suggest ginger beer; floral and honey-like suggest certain teas. When unsure between two options, eliminate the ones that contradict the production or origin clue in the question.`,
  settings: drinksTypesQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: DrinksTypesQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: DrinksTypesQuiz,
};
