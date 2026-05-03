import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { NordicCuisineQuizState, NordicCuisineQuizAction, NordicCuisineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NordicCuisineQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NordicCuisineQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nordicCuisineQuizPlugin: GamePlugin<NordicCuisineQuizState, NordicCuisineQuizAction, typeof settings> = {
  id:"nordic-cuisine-quiz", title:"Nordic Cuisine Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Smorrebrod, gravlax, lutefisk, and New Nordic cuisine.",
  howToPlay:`Nordic Cuisine Quiz tests your knowledge of smorrebrod, gravlax, lutefisk, and New Nordic cuisine. Each question presents four answer choices; select one and submit before the 15-second timer runs out.

Correct answers earn 100 base points plus 10 points for every second you had remaining on the clock — answer quickly to maximize your tally. Wrong answers earn nothing, and the right answer is always revealed before you continue.

Tap a choice to select it (the box turns blue), then press Submit to lock in. Correct selections glow green; incorrect ones turn red while the right answer also lights up. Press Next to advance.

Choose 5 or 10 questions in Settings — Settings, then Questions. The pool is randomized and the choices within each question are shuffled, so even repeated plays feel fresh. Whether you are a casual home cook curious about world cuisine or a dedicated foodie traveler, this quiz is a tasty way to test your knowledge.

Eat well and quiz hard!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NordicCuisineQuizSettings),
  reducer,isTerminal,
  hint: (state: NordicCuisineQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NordicCuisineQuizGame,
};
