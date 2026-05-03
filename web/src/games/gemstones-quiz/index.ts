import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GemstonesQuizState, GemstonesQuizAction, GemstonesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GemstonesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GemstonesQuiz as unknown as React.ComponentType<unknown> })));
const gemstonesQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type GemstonesQuizSettingsType = SettingsOf<typeof gemstonesQuizSettings>;

export const gemstonesQuizPlugin: GamePlugin<GemstonesQuizState, GemstonesQuizAction, typeof gemstonesQuizSettings> = {
  id: "gemstones-quiz",
  title: "Gemstones Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of precious and semi-precious gems — diamonds, rubies, emeralds, opals, and the science behind their beauty.",
  howToPlay: `Gemstones Quiz tests your knowledge of the sparkling world of precious and semi-precious stones. Questions cover gem types, properties, famous specimens, birthstones, mineral families, and the geological processes that create these natural treasures.

You have 15 seconds per question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the clock. Fast correct answers earn the most.

Click a choice to select it, then press Submit. The correct option highlights green after submission; wrong selections turn red. Press Next to advance.

Use Settings to choose 10, 20, or 30 questions drawn randomly from a pool of 30 gemology questions.

Final score and accuracy are shown at the end. Whether you are a casual jewelry admirer or a seasoned gemologist, Gemstones Quiz will test how well you know Earth's most precious minerals!`,
  settings: gemstonesQuizSettings,
  initialState: (seed: number, settings: GemstonesQuizSettingsType) => initialState(seed, settings as GemstonesQuizSettings),
  reducer,
  isTerminal,
  hint: (state: GemstonesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: GemstonesQuiz,
};
