import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoxingRulesQuizState, BoxingRulesQuizAction, BoxingRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BoxingRulesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BoxingRulesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const boxingRulesQuizPlugin: GamePlugin<BoxingRulesQuizState, BoxingRulesQuizAction, typeof settings> = {
  id:"boxing-rules-quiz", title:"Boxing Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of boxing rules, scoring, and weight classes.",
  howToPlay:`Boxing Rules Quiz tests your knowledge of the sweet science. Questions cover the basic structure of a fight: round length (3 minutes), rest periods (1 minute), scoring systems (the 10-point must), and the various ways a fight can end — KO, TKO, decisions, draws, and disqualifications.

You'll be quizzed on weight classes from flyweight up through heavyweight, the legality (and illegality) of various blows like rabbit punches and below-the-belt strikes, glove regulations, and the differences between Olympic amateur boxing (3x3 minute rounds) and professional championship fights (12 rounds).

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining on the timer; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always revealed.

Choose 10 or 20 questions in Settings. Whether you're a casual fan or an aspiring referee, this quiz keeps your boxing knowledge sharp. No bell to save you!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BoxingRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: BoxingRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BoxingRulesQuizGame,
};
