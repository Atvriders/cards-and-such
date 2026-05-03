import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TongitsQuizState, TongitsQuizAction, TongitsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TongitsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TongitsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tongitsQuizPlugin: GamePlugin<TongitsQuizState, TongitsQuizAction, typeof settings> = {
  id:"tongits-quiz", title:"Tongits Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Filipino three-player rummy game Tongits.",
  howToPlay:"Tongits is a popular three-player rummy game from the Philippines, in which players form melds (sets and runs) and try to be the first to lay them all down. It blends rummy and gin mechanics with local twists.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four lettered choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing, and if you let the timer run out, the question is marked wrong automatically.\n\nAfter you submit, the correct answer is revealed in green and an incorrect choice in red. Press Next to move on to the next question. The quiz ends after all 10 questions and your final score and number of correct answers are shown. Try to beat your best score on subsequent runs.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TongitsQuizSettings),
  reducer,isTerminal,
  hint: (state: TongitsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TongitsQuizGame,
};
