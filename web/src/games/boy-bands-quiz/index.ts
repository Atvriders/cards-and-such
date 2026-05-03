import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoyBandsQuizState, BoyBandsQuizAction, BoyBandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BoyBandsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BoyBandsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const boyBandsQuizPlugin: GamePlugin<BoyBandsQuizState, BoyBandsQuizAction, typeof settings> = {
  id:"boy-bands-quiz", title:"Boy Bands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Boy band history: Backstreet Boys, NSYNC, BTS, and beyond.",
  howToPlay:"Boy Bands Quiz pulls 10, 20, or 30 random questions from a curated pool. You get 15 seconds per question and every second remaining adds 10 bonus points to a correct answer's base 100, so quick confident answers crush slow ones.\n\nTap a choice (A, B, C, or D) to select it, then press Submit. Correct answers glow green and the right answer is always revealed before you advance, so you learn even when you miss. Wrong answers earn no points: there is no partial credit.\n\nPress Next to continue. Questions are drawn from the same shared pool, but the seed and shuffle order vary, so every session feels fresh. The answer order itself is randomized so you cannot memorize positional patterns.\n\nChoose the question count in Settings. Average runs land in the 800-1500 point range; sharp answers under 5 seconds can push you well past 2000 over a 20-question session. Sharpen up and play through the rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BoyBandsQuizSettings),
  reducer,isTerminal,
  hint: (state: BoyBandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BoyBandsQuizGame,
};
