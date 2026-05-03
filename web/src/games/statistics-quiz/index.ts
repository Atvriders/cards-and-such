import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StatisticsQuizState, StatisticsQuizAction, StatisticsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StatisticsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StatisticsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const statisticsQuizPlugin: GamePlugin<StatisticsQuizState, StatisticsQuizAction, typeof settings> = {
  id:"statistics-quiz", title:"Statistics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Statistics fundamentals: mean, median, mode, distributions, probability basics.",
  howToPlay:"Statistics Quiz tests your knowledge of measures of central tendency and dispersion, distributions, sampling, and inferential basics. Topics include mean, median, mode, range, variance, standard deviation, normal distribution, percentiles, correlation versus causation, p-values, confidence intervals, and basic hypothesis testing.\n\nYou have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining. Wrong answers earn zero, but the correct answer is shown so you can learn.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're a stats student, data scientist, or just curious about how polls work, this quiz will sharpen your statistical literacy. Remember — correlation doesn't imply causation!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StatisticsQuizSettings),
  reducer,isTerminal,
  hint: (state: StatisticsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StatisticsQuizGame,
};
