import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PMState, PMAction, PMSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PrimeMinistersQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PrimeMinistersQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const primeMinistersQuizPlugin: GamePlugin<PMState, PMAction, typeof settings> = {
  id: "prime-ministers-quiz", title: "Prime Ministers Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of Prime Ministers from the UK, Canada, Australia, India, and more.",
  howToPlay: `Prime Ministers Quiz covers the parliamentary leaders who have shaped modern democratic nations. Questions span the UK from Robert Walpole to Rishi Sunak, plus Prime Ministers of Canada, Australia, India, Israel, Japan, and more.

You have 15 seconds to answer each question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Swift, accurate answers score the best.

Click your choice and press Submit. The correct answer highlights green; wrong selections turn red. Press Next to continue.

Settings let you choose 10, 20, or 30 questions from a pool of 30 covering policy achievements, personal milestones, record-breaking tenures, assassinations, scandals, and memorable quotes.

From Winston Churchill's wartime leadership to Jacinda Ardern's modern progressive governance, Prime Ministers Quiz challenges you to name the leaders and the moments that defined their terms in office!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as PMSettings),
  reducer, isTerminal, 
  hint: (state: PMState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PrimeMinistersQuiz,
};
