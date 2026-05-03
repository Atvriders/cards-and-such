import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TacoVsBurritoQuizState, TacoVsBurritoQuizAction, TacoVsBurritoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TacoVsBurritoQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TacoVsBurritoQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tacoVsBurritoQuizPlugin: GamePlugin<TacoVsBurritoQuizState, TacoVsBurritoQuizAction, typeof settings> = {
  id:"taco-vs-burrito-quiz", title:"Taco vs. Burrito Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Taco vs. Burrito, the silly-ingredient food-battle card game.",
  howToPlay:"Taco vs. Burrito Trivia is a ten-question quiz about the small-format viral card game where players compete to cook the most ridiculous taco or burrito by adding wild ingredients (a cell phone! a kraken!) and bombing each other with hot peppers and pizza-cutters. Each round you'll be tested on its unusual origin (it was created by a 7-year-old), the ingredient cards, action cards, the publisher, and how points are scored. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Taco vs. Burrito's quirky charm and underdog backstory made it a Kickstarter sensation — see how much culinary chaos you can recall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TacoVsBurritoQuizSettings),
  reducer,isTerminal,
  hint: (state: TacoVsBurritoQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TacoVsBurritoQuizGame,
};
