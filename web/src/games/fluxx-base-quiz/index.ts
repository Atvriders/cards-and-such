import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxBaseQuizState, FluxxBaseQuizAction, FluxxBaseQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxBaseQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxBaseQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxBaseQuizPlugin: GamePlugin<FluxxBaseQuizState, FluxxBaseQuizAction, typeof settings> = {
  id:"fluxx-base-quiz", title:"Fluxx Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Fluxx, the original ever-changing-rules card game by Andrew Looney.",
  howToPlay:"Fluxx Trivia is a ten-question quiz about Andrew Looney's classic Fluxx, the card game that begins with a single rule (Draw 1, Play 1) and warps wildly as new rule and goal cards are played. Each round you'll be tested on the four card types — Basic Rules, Goals, Keepers, Actions — its publisher Looney Labs, its many themed editions, and the iconic Creeper card type added later. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Fluxx is famed for being the game where the rules themselves are the cards — see how much trivia about its meta-mayhem you can keep up with.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FluxxBaseQuizSettings),
  reducer,isTerminal,
  hint: (state: FluxxBaseQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FluxxBaseQuizGame,
};
