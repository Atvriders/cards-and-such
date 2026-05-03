import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitGenusQuizState, TrivialPursuitGenusQuizAction, TrivialPursuitGenusQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrivialPursuitGenusQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TrivialPursuitGenusQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitGenusQuizPlugin: GamePlugin<TrivialPursuitGenusQuizState, TrivialPursuitGenusQuizAction, typeof settings> = {
  id:"trivial-pursuit-genus-quiz", title:"Trivial Pursuit Genus Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Meta-trivia about the original Trivial Pursuit Genus Edition: history, categories, and design.",
  howToPlay:"Trivial Pursuit Genus Trivia is the meta-trivia experience: questions about the original Trivial Pursuit Genus Edition itself — its inventors, its publication history, the colors of its category wedges, and the iconic 'pie' goal at the heart of the game. There are ten questions per round. Tap a choice and press Submit. Each correct answer earns 100 base points plus 10 points for every second remaining on the 15-second timer, so think and click quickly. A wrong choice locks in and reveals the correct answer; press Next to continue. After ten questions, your final score appears. Whether you're a TP veteran who painstakingly collected pies in the 1980s or someone who heard the brand name and remembered yuppie dinner parties, this quiz will tell you whether you really know the game behind the game.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitGenusQuizSettings),
  reducer,isTerminal,
  hint: (state: TrivialPursuitGenusQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrivialPursuitGenusQuizGame,
};
