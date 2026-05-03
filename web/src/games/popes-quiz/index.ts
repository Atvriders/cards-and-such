import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PopesState, PopesAction, PopesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PopesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PopesQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const popesQuizPlugin: GamePlugin<PopesState, PopesAction, typeof settings> = {
  id: "popes-quiz", title: "Popes Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of the history of the papacy — from Saint Peter to Pope Francis.",
  howToPlay: `Popes Quiz covers two millennia of Catholic history through the leaders of the Church. Questions span the early papacy, the medieval period, the Renaissance, the Reformation, and the modern era — from the first controversies of Christianity to the 21st-century pontificate of Pope Francis.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Answer quickly and accurately for the highest score.

Click your choice and press Submit. Correct answers highlight green; wrong picks turn red. Press Next to continue.

Settings let you choose 10, 20, or 30 questions from a pool of 30 covering famous popes, their decisions, controversies, the Crusades, the Inquisition, Vatican II, and more.

Whether you are a historian, a student of religion, or simply curious about one of the world's most enduring institutions, Popes Quiz will challenge your knowledge of the men who shaped Western civilization!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as PopesSettings),
  reducer, isTerminal, 
  hint: (state: PopesState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PopesQuiz,
};
