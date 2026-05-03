import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LigrettoKidsQuizState, LigrettoKidsQuizAction, LigrettoKidsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LigrettoKidsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LigrettoKidsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ligrettoKidsQuizPlugin: GamePlugin<LigrettoKidsQuizState, LigrettoKidsQuizAction, typeof settings> = {
  id:"ligretto-kids-quiz", title:"Ligretto Kids Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Ligretto Kids, the simpler animal-themed Ligretto speed card game.",
  howToPlay:"Ligretto Kids Trivia is a ten-question quiz about the children's edition of the Ligretto / Dutch Blitz speed card game family, where players simultaneously race to empty their personal pile by playing matching animal cards onto shared piles. Each round you'll be tested on the publisher Schmidt Spiele, the simpler animal-art design, age recommendations, the difference from adult Ligretto, and rules for the famous racing cry. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Ligretto Kids welcomes young hands into the simultaneous-play card-game tradition — see how well you remember its kid-friendly twist.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LigrettoKidsQuizSettings),
  reducer,isTerminal,
  hint: (state: LigrettoKidsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:LigrettoKidsQuizGame,
};
