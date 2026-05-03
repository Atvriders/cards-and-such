import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpicesQuizState, SpicesQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpicesQuiz = /* @__PURE__ */ lazy(() => import("./SpicesQuiz.js").then((mod) => ({ default: mod.SpicesQuiz as unknown as React.ComponentType<unknown> })));
export const spicesQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof spicesQuizSettings>;

export const spicesQuizPlugin: GamePlugin<SpicesQuizState, SpicesQuizAction, typeof spicesQuizSettings> = {
  id: "spices-quiz",
  title: "Spices Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of herbs and spices from around the world.",
  howToPlay: `Spices Quiz challenges your knowledge of the flavorful world of herbs and spices. Each question presents a fact or description about a spice, and you must choose the correct answer from four options.

After you select an answer, the correct choice is highlighted in green. If you chose wrong, your selection turns red while the correct answer is revealed. Click Next to move on to the following question.

Each correct answer earns 10 points. Your total score appears at the end of the quiz. Choose 5, 10, or 15 questions in the settings to adjust the length of your session.

Topics covered include the origins of common spices, which plants they come from, how they are processed, their culinary uses across different cuisines, and interesting historical facts. You will encounter questions about saffron, cinnamon, turmeric, cardamom, cloves, vanilla, and many more.

Tips: Think about where famous spices originate — India and Asia produce many of the world's most prized spices. Color is often a clue — yellow usually means turmeric or saffron. When in doubt, eliminate answers that belong to a completely different category.`,
  settings: spicesQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SpicesQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: SpicesQuiz,
};
