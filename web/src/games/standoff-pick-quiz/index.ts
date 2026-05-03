import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StandoffPickQuizState, StandoffPickQuizAction, StandoffPickQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StandoffPickQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StandoffPickQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const standoffPickQuizPlugin: GamePlugin<StandoffPickQuizState, StandoffPickQuizAction, typeof settings> = {
  id:"standoff-pick-quiz", title:"Standoff Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Standoff, the internet rock-paper-scissors-with-weapons micro game.",
  howToPlay:"Standoff Trivia is a ten-question quiz about Standoff, a quick web-based two-player game in the vein of rock-paper-scissors where each player secretly picks a weapon and the rules of which beats which form a cycle reminiscent of classic Mexican standoff fiction. Each round you'll be tested on the standard weapon set (rock-paper-scissors-spock-lizard, scissors-beats-gun-style cycles), the game's spread on internet forums, common variants, and the term 'Mexican standoff' from cinema. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Standoff is a classic example of how simple math becomes a viral game — test your standoff smarts.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StandoffPickQuizSettings),
  reducer,isTerminal,
  hint: (state: StandoffPickQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StandoffPickQuizGame,
};
