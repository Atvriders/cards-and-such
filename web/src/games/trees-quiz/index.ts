import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TreesQuizState, TreesQuizAction, TreesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TreesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TreesQuiz as unknown as React.ComponentType<unknown> })));
const treesQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type TreesQuizSettingsType = SettingsOf<typeof treesQuizSettings>;

export const treesQuizPlugin: GamePlugin<TreesQuizState, TreesQuizAction, typeof treesQuizSettings> = {
  id: "trees-quiz",
  title: "Trees Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of the world's trees — from towering redwoods to ancient bristlecone pines and tropical giants.",
  howToPlay: `Trees Quiz challenges your knowledge of arboreal wonders from around the globe. Questions cover record-holding trees, wood uses, leaf types, tree biology, famous species, and fascinating adaptations that allow trees to thrive in every environment on Earth.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Fast, accurate answers maximize your final score.

Click a choice to select it, then press Submit. After answering, the correct option highlights green and any wrong selection turns red. Press Next to continue to the next question.

Use Settings to choose 10, 20, or 30 questions. Questions are drawn from a pool of 30 tree facts covering species from baobabs and mangroves to bristlecone pines and giant sequoias.

Your final score and accuracy are displayed at the end. Whether you are a casual nature lover or an experienced arborist, Trees Quiz will grow your knowledge one ring at a time!`,
  settings: treesQuizSettings,
  initialState: (seed: number, settings: TreesQuizSettingsType) => initialState(seed, settings as TreesQuizSettings),
  reducer,
  isTerminal,
  hint: (state: TreesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TreesQuiz,
};
