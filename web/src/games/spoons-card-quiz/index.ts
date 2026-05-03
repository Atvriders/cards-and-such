import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpoonsCardQuizState, SpoonsCardQuizAction, SpoonsCardQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpoonsCardQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpoonsCardQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spoonsCardQuizPlugin: GamePlugin<SpoonsCardQuizState, SpoonsCardQuizAction, typeof settings> = {
  id:"spoons-card-quiz", title:"Spoons Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Spoons, the four-of-a-kind grab-the-spoon classic family game.",
  howToPlay:"Spoons Trivia is a ten-question quiz about Spoons, the long-loved family card game where players pass cards around the table trying to collect four of a kind, then secretly grab a spoon from the center to win the round before others notice and grab one of the remaining (one-fewer-than-players) spoons. Each round you'll be tested on its history, the spelling-out of S-P-O-O-N-S as elimination letters, basic rules, recommended ages, and variant 'Pig' (touch your nose). Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Spoons is a generations-old camp classic — see how much you remember.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpoonsCardQuizSettings),
  reducer,isTerminal,
  hint: (state: SpoonsCardQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SpoonsCardQuizGame,
};
