import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SummerHitsQuizState, SummerHitsQuizAction, SummerHitsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SummerHitsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SummerHitsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const summerHitsQuizPlugin: GamePlugin<SummerHitsQuizState, SummerHitsQuizAction, typeof settings> = {
  id:"summer-hits-quiz", title:"Summer Hits Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of summer pop hits across the decades.",
  howToPlay:"Summer Hits Quiz celebrates the songs that defined sunshine, beaches, road trips, and pool parties. Questions cover decades of summer chart climbers — Beach Boys' surf-rock, disco anthems, '80s pop bangers, '90s reggae crossovers, and modern pop and Latin smashes that own the airwaves from June to September.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Roll the windows down and turn it up — this quiz is a summer mixtape!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SummerHitsQuizSettings),
  reducer,isTerminal,
  hint: (state: SummerHitsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SummerHitsQuizGame,
};
