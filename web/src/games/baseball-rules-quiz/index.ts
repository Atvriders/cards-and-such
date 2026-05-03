import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaseballRulesQuizState, BaseballRulesQuizAction, BaseballRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BaseballRulesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BaseballRulesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const baseballRulesQuizPlugin: GamePlugin<BaseballRulesQuizState, BaseballRulesQuizAction, typeof settings> = {
  id:"baseball-rules-quiz", title:"Baseball Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of baseball: strikes, outs, the infield fly rule, and ballpark rules.",
  howToPlay:`Baseball Rules Quiz puts your knowledge of America's pastime under the microscope. Questions span the basics (innings, outs, balls and strikes) and the technical (the infield fly rule, balks, the dropped third strike, runner interference, the designated hitter, and tag-up rules).

You have 15 seconds per question. Correct answers score 100 points plus 10 points per second remaining on the clock. Wrong answers score zero. Speed plus accuracy wins.

Expect questions on field dimensions (90 feet between bases, the pitcher's mound 60 feet 6 inches from the plate), modern rules (extra-innings ghost runner, pitch clock), and classic plays (the 6-4-3 double play, sacrifice fly scoring, and balk rules). MLB, college, and amateur differences appear too.

Choose 10, 20, or 30 questions in Settings. Tap, Submit, Next — that's it. From the bleacher fan to the box-score nerd, this quiz will test your love of the game!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BaseballRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: BaseballRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BaseballRulesQuizGame,
};
