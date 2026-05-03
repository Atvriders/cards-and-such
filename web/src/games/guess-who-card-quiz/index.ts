import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GuessWhoCardQuizState, GuessWhoCardQuizAction, GuessWhoCardQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GuessWhoCardQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GuessWhoCardQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const guessWhoCardQuizPlugin: GamePlugin<GuessWhoCardQuizState, GuessWhoCardQuizAction, typeof settings> = {
  id:"guess-who-card-quiz", title:"Guess Who? Card Game Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Guess Who? Card Game, the compact face-deduction card variant.",
  howToPlay:"Guess Who? Card Game Trivia is a ten-question quiz about the streamlined card-flip edition of the classic Hasbro deduction game, where each player tries to identify the opponent's mystery character by asking yes-or-no feature questions. Each round you'll be tested on the difference between the boxed board version and the card edition, the typical character roster, the rules for asking questions, and the publisher. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, rewarding speed. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions your final score is displayed. The Guess Who? Card Game packs a surprising amount of deduction into a small box — see how much you remember of this travel-friendly classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GuessWhoCardQuizSettings),
  reducer,isTerminal,
  hint: (state: GuessWhoCardQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GuessWhoCardQuizGame,
};
