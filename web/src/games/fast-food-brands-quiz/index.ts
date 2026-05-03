import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FastFoodBrandsQuizState, FastFoodBrandsQuizAction, FastFoodBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FastFoodBrandsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FastFoodBrandsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fastFoodBrandsQuizPlugin: GamePlugin<FastFoodBrandsQuizState, FastFoodBrandsQuizAction, typeof settings> = {
  id:"fast-food-brands-quiz", title:"Fast Food Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Burger chains, fried chicken, pizza giants and quick-service icons.",
  howToPlay:"Fast Food Brands Quiz tests your knowledge of the global quick-service industry. Questions span McDonald's, Burger King, KFC, Wendy's, Taco Bell, Subway and many more — including signature menu items, slogans, mascots, founders, and the franchise wars that built fast food into a worldwide phenomenon.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Order up — see how many fast-food trivia points you can supersize before the timer expires!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FastFoodBrandsQuizSettings),
  reducer,isTerminal,
  hint: (state: FastFoodBrandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FastFoodBrandsQuizGame,
};
