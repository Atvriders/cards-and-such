import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConcentrationSpeedQuizState, ConcentrationSpeedQuizAction, ConcentrationSpeedQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConcentrationSpeedQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConcentrationSpeedQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const concentrationSpeedQuizPlugin: GamePlugin<ConcentrationSpeedQuizState, ConcentrationSpeedQuizAction, typeof settings> = {
  id:"concentration-speed-quiz", title:"Concentration Speed Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Concentration Speed Variants, the timed memory match-flip game.",
  howToPlay:"Concentration Speed Trivia is a ten-question quiz dedicated to the timed variants of the classic Concentration / Memory tile-matching game, where players are pushed to flip and match cards within seconds rather than at leisure. Each round you'll be tested on the rules of timed concentration, common house rules, the way speed transforms the strategy, players' age recommendations, and the cognitive science behind why short-term memory benefits from urgency. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Speed-Concentration variants are popular at family game nights and party events because they shrink a sometimes slow game into a frantic, exciting sprint — see how much trivia about its racing version you can recall in time.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ConcentrationSpeedQuizSettings),
  reducer,isTerminal,
  hint: (state: ConcentrationSpeedQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ConcentrationSpeedQuizGame,
};
