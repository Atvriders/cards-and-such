import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BirdsQuizState, BirdsQuizAction, BirdsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BirdsQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BirdsQuiz as unknown as React.ComponentType<unknown> })));
const birdsQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type BirdsQuizSettingsType = SettingsOf<typeof birdsQuizSettings>;

export const birdsQuizPlugin: GamePlugin<BirdsQuizState, BirdsQuizAction, typeof birdsQuizSettings> = {
  id: "birds-quiz",
  title: "Birds Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of the avian world — from raptors and songbirds to penguins and record-breaking migratory species.",
  howToPlay: `Birds Quiz challenges your knowledge of the world's incredible avian diversity. Questions cover everything from record holders — largest, fastest, smallest — to migration feats, courtship behaviors, nesting habits, and fascinating adaptations that let birds thrive on every continent.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the timer. Fast correct answers maximize your score.

Click a choice to select it, then press Submit. After answering, the correct option highlights green and any wrong selection turns red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions. Questions are randomly selected from a pool of 30 bird facts covering species from albatrosses and hummingbirds to kiwis and cassowaries.

Your final score and accuracy are shown at the end. Whether you are a casual birdwatcher or a dedicated ornithologist, Birds Quiz will test and expand your feathered knowledge!`,
  settings: birdsQuizSettings,
  initialState: (seed: number, settings: BirdsQuizSettingsType) => initialState(seed, settings as BirdsQuizSettings),
  reducer,
  isTerminal,
  hint: (state: BirdsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: BirdsQuiz,
};
