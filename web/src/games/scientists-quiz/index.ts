import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScientistsState, ScientistsAction, ScientistsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ScientistsQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ScientistsQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;

export const scientistsQuizPlugin: GamePlugin<ScientistsState, ScientistsAction, typeof settings> = {
  id: "scientists-quiz",
  title: "Scientists Quiz",
  category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of history's greatest scientists — from Newton and Darwin to Curie and Einstein.",
  howToPlay: `Scientists Quiz celebrates the brilliant minds who unlocked the secrets of the universe. Questions cover physicists, chemists, biologists, astronomers, and inventors across all eras — from Copernicus to Stephen Hawking.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Fast and accurate answers yield the best scores.

Click your answer choice, then press Submit. The correct answer turns green; any wrong pick turns red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Topics include landmark discoveries, Nobel Prizes, famous inventions, and the defining theories that changed our understanding of nature.

Whether you are a science teacher, a curious student, or simply fascinated by human ingenuity, Scientists Quiz will challenge and inspire you through some of history's most remarkable discoveries!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as ScientistsSettings),
  reducer, isTerminal, 
  hint: (state: ScientistsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ScientistsQuiz,
};
