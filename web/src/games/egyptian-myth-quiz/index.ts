import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EgyptianMythQuizState, EgyptianMythQuizAction, EgyptianMythQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EgyptianMythQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EgyptianMythQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const egyptianMythQuizPlugin: GamePlugin<EgyptianMythQuizState, EgyptianMythQuizAction, typeof settings> = {
  id:"egyptian-myth-quiz", title:"Egyptian Mythology Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Ra, Anubis, Isis, and the gods of the Nile.",
  howToPlay:"Egyptian Mythology Quiz is a multiple-choice trivia challenge. You have 15 seconds for each question, with four answer choices labeled A through D. Select an answer and press Submit. Each correct answer awards 100 base points plus a 10-point bonus for every second remaining on the clock — so quick recall pays off! Wrong answers earn no points, and the right answer is always revealed before you continue.\n\nYou can choose 10, 20, or 30 questions in Settings. Questions and answer choices are shuffled each game, so even repeat play feels fresh. Take your time on the first few questions to warm up, then hit your stride and chase the time bonus on the ones you know cold.\n\nWhether you are a casual fan or a serious enthusiast, this quiz will reward both deep knowledge and snap judgement. The result screen tallies your correct count and final score — push for that perfect run!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EgyptianMythQuizSettings),
  reducer,isTerminal,
  hint: (state: EgyptianMythQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:EgyptianMythQuizGame,
};
