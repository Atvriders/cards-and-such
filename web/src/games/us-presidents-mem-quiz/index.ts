import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UsPresidentsMemQuizState, UsPresidentsMemQuizAction, UsPresidentsMemQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UsPresidentsMemQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UsPresidentsMemQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const usPresidentsMemQuizPlugin: GamePlugin<UsPresidentsMemQuizState, UsPresidentsMemQuizAction, typeof settings> = {
  id:"us-presidents-mem-quiz", title:"US Presidents Memory Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about US Presidents Memory, the presidential portrait memory tile game.",
  howToPlay:"US Presidents Memory Quiz is a ten-question quiz about the educational variant of the classic concentration matching game where tiles depict portraits of United States Presidents. Each round you'll be tested on the deck's contents, the order in which Presidents took office, common educational variants, the basic match rules, and the publishers who make these decks. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is shown. US Presidents Memory has been a classic homeschool and classroom staple for generations, mixing fun with American civics — test how much you remember from a deck designed to be remembered.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UsPresidentsMemQuizSettings),
  reducer,isTerminal,
  hint: (state: UsPresidentsMemQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:UsPresidentsMemQuizGame,
};
