import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuropeanCuisineQuizState, EuropeanCuisineQuizAction, EuropeanCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EuropeanCuisineQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EuropeanCuisineQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const europeanCuisineQuizPlugin: GamePlugin<EuropeanCuisineQuizState, EuropeanCuisineQuizAction, typeof settings> = {
  id: "european-cuisine-quiz", title: "European Cuisine Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of dishes, ingredients, and cooking traditions from across Europe.",
  howToPlay: `European Cuisine Quiz tests your knowledge of dishes, ingredients, and culinary traditions. Each question offers four possible answers — tap the correct one to earn 10 points.

After answering, the correct choice is highlighted in green. Wrong answers are marked red. Press Next to continue.

Play 5, 10, or 15 questions per session — choose in Settings. Questions are shuffled each game.

Tips: Pay attention to regional clues in each question. Many dishes are strongly tied to a specific city or region within a country. Look for ingredient keywords that narrow down your choices.

Challenge yourself across multiple sessions to improve your score and deepen your knowledge of this rich culinary tradition!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as EuropeanCuisineQuizSettings),
  reducer, isTerminal, 
  hint: (state: EuropeanCuisineQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: EuropeanCuisineQuiz,
};
