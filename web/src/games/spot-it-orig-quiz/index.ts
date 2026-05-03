import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpotItOrigQuizState, SpotItOrigQuizAction, SpotItOrigQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpotItOrigQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpotItOrigQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spotItOrigQuizPlugin: GamePlugin<SpotItOrigQuizState, SpotItOrigQuizAction, typeof settings> = {
  id:"spot-it-orig-quiz", title:"Spot It! Original Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about the original Spot It! / Dobble symbol-matching reaction card game.",
  howToPlay:"Spot It! Original Trivia is a ten-question quiz about the worldwide hit symbol-matching card game (called Dobble in Europe), where every two cards in the deck share exactly one symbol and players race to spot it first. Each round you'll be tested on the math behind the deck (a finite projective plane construction), the publisher Asmodee/Blue Orange, the suite of mini-games (Tower, Well, Hot Potato, etc.), and recommended player counts. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so quick recall is rewarded. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score appears. Spot It! is one of the bestselling card games of the modern era — see how much trivia about its tiny, perfect math you can recall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpotItOrigQuizSettings),
  reducer,isTerminal,
  hint: (state: SpotItOrigQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SpotItOrigQuizGame,
};
