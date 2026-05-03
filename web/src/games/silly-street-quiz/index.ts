import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SillyStreetQuizState, SillyStreetQuizAction, SillyStreetQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SillyStreetQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SillyStreetQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sillyStreetQuizPlugin: GamePlugin<SillyStreetQuizState, SillyStreetQuizAction, typeof settings> = {
  id:"silly-street-quiz", title:"Silly Street Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Silly Street, the children's wacky physical-challenge card party game.",
  howToPlay:"Silly Street Trivia is a ten-question quiz about the kids' party game where players draw cards instructing them to perform silly physical or vocal challenges on their way down a colourful street. Each round you'll be tested on Silly Street's publisher, target age, the kinds of cards drawn, the simple board layout, and the way kids advance by completing challenges. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so quick recall is rewarded. A wrong answer reveals the correct option and locks the round so you can press Next. After ten questions your final score is displayed. Silly Street is known for its joyfully chaotic energy and the way it gets even shy children moving and laughing — test how much you remember about its wholesome chaos.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SillyStreetQuizSettings),
  reducer,isTerminal,
  hint: (state: SillyStreetQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SillyStreetQuizGame,
};
