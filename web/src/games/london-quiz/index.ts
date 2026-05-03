import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LondonQuizState, LondonQuizAction, LondonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LondonQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LondonQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const londonQuizPlugin: GamePlugin<LondonQuizState, LondonQuizAction, typeof settings> = {
  id:"london-quiz", title:"London Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Quiz on London's landmarks, history, and culture.",
  howToPlay:"London Quiz tests your knowledge of London landmarks and history across 10 or 20 multiple-choice questions. Each question has four answer choices and a 15-second timer.\n\nWhen the question appears, read carefully and tap the choice you think is correct, then press Submit. Correct answers earn 100 base points plus 10 bonus points for every second remaining on the clock — quick thinking pays off. Wrong answers earn zero, and the timer running out submits a blank.\n\nAfter you submit, the right answer glows green and any wrong choice you picked turns red, so you always learn the correct answer before continuing. Press Next to move on.\n\nYou can choose 10 or 20 questions in the Settings panel before starting. Questions are shuffled from a pool every game, and the answer choices are also reordered, so two runs in a row never feel the same. Mix knowledge with reflexes for the highest score, and aim for a perfect run!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LondonQuizSettings),
  reducer,isTerminal,
  hint: (state: LondonQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:LondonQuizGame,
};
