import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ExplodingMinionsQuizState, ExplodingMinionsQuizAction, ExplodingMinionsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ExplodingMinionsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ExplodingMinionsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const explodingMinionsQuizPlugin: GamePlugin<ExplodingMinionsQuizState, ExplodingMinionsQuizAction, typeof settings> = {
  id:"exploding-minions-quiz", title:"Exploding Minions Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Exploding Minions, the Despicable-Me-themed Exploding Kittens edition.",
  howToPlay:"Exploding Minions Trivia is a ten-question quiz about the Despicable Me–themed standalone version of Exploding Kittens, where banana-loving Minions replace the cats but most of the core mechanics remain. Each round you'll be tested on the publisher Exploding Kittens Inc., the licensing partner Universal/Illumination, the new card art, and how it merges with the regular Exploding Kittens base deck. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Exploding Minions delivers the same explosive joy with a different IP coat of paint — see how much you remember about its tropical yellow chaos.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ExplodingMinionsQuizSettings),
  reducer,isTerminal,
  hint: (state: ExplodingMinionsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ExplodingMinionsQuizGame,
};
