import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BasketballRulesQuizState, BasketballRulesQuizAction, BasketballRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BasketballRulesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BasketballRulesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const basketballRulesQuizPlugin: GamePlugin<BasketballRulesQuizState, BasketballRulesQuizAction, typeof settings> = {
  id:"basketball-rules-quiz", title:"Basketball Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of basketball rules: fouls, violations, shot clock, and gameplay.",
  howToPlay:`Basketball Rules Quiz tests your knowledge of how the great game is officiated. Questions cover fundamental rules — traveling, double-dribble, three-second violations, the shot clock, the eight-second backcourt rule, and the difference between personal and technical fouls. Expect to be asked about NBA dimensions, the three-point line distance, free throws, jump balls, possession arrows in college basketball, and overtime procedures.

You have 15 seconds to answer each question. Correct answers earn 100 base points plus 10 bonus points for every second remaining on the clock — fast and accurate scoring is the key to a great total. Wrong or unanswered questions earn nothing.

Tap your choice and press Submit. Right answers glow green, wrong ones turn red, and the correct answer is always revealed before you move on. Choose 10, 20, or 30 questions in Settings.

Whether you watch the NBA, college, FIBA, or weekend pickup, this quiz will sharpen your knowledge of the rulebook!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BasketballRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: BasketballRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BasketballRulesQuizGame,
};
