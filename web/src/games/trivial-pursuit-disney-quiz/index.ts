import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitDisneyQuizState, TrivialPursuitDisneyQuizAction, TrivialPursuitDisneyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrivialPursuitDisneyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TrivialPursuitDisneyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitDisneyQuizPlugin: GamePlugin<TrivialPursuitDisneyQuizState, TrivialPursuitDisneyQuizAction, typeof settings> = {
  id:"trivial-pursuit-disney-quiz", title:"Trivial Pursuit Disney Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia from the Disney edition: princes, princesses, parks, films, and Pixar greats.",
  howToPlay:"Trivial Pursuit Disney Trivia presents ten questions covering the Walt Disney Company's films, founders, theme parks, princesses, and Pixar imprints. Topics range from the earliest Mickey Mouse cartoons to the modern Frozen and Pixar era. Tap your answer and press Submit. A correct answer rewards 100 base points plus 10 points for each second remaining on the 15-second timer — so quick recall pays. A wrong answer reveals the correct choice and locks the round; tap Next to continue. After question ten, your final score is shown. If you have memorized every Disney princess in chronological order, hummed 'A Whole New World' since childhood, or visited a Disney park more than three times, you should ace this quiz. If not, you'll still pick up some magical history along the way.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitDisneyQuizSettings),
  reducer,isTerminal,
  hint: (state: TrivialPursuitDisneyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrivialPursuitDisneyQuizGame,
};
