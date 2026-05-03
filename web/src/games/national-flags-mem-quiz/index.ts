import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NationalFlagsMemQuizState, NationalFlagsMemQuizAction, NationalFlagsMemQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NationalFlagsMemQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NationalFlagsMemQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nationalFlagsMemQuizPlugin: GamePlugin<NationalFlagsMemQuizState, NationalFlagsMemQuizAction, typeof settings> = {
  id:"national-flags-mem-quiz", title:"Flags Memory Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about National Flags Memory, the country-flag pair-matching memory tile game.",
  howToPlay:"Flags Memory Quiz is a ten-question quiz about National Flags Memory, the popular variant of the classic concentration tile game which uses country flags as the matching pair art. Each round you'll be tested on the rules of the original concentration game, common flag-deck contents, how it doubles as a geography learning aid for children and adults, and the typical card counts and matching mechanics. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 per second left on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Flag-themed memory decks have been a favourite educational toy for decades, blending fun with subtle geography learning — see how many flag-game facts you can recall from memory.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NationalFlagsMemQuizSettings),
  reducer,isTerminal,
  hint: (state: NationalFlagsMemQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NationalFlagsMemQuizGame,
};
