import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { GeekOutQuizState, GeekOutQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GeekOutQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GeekOutQuiz as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const geekOutQuizPlugin: GamePlugin<GeekOutQuizState, GeekOutQuizAction, typeof settings> = {
  id: "geek-out-quiz",
  title: "Geek Out Quiz",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid-how-many-items category party trivia.",
  howToPlay: "Geek Out Quiz is a quick trivia quiz with ten multiple-choice questions. Bid-how-many-items category party trivia. Each question has four answer options; pick the one you think is correct.\n\nSpecial context: 10 trivia questions about geek categories from Geek Out.\n\nClick the answer button you believe is right. The correct answer is highlighted instantly and your score updates. A correct answer earns you 100 points; incorrect answers earn nothing. After ten questions your final score is shown out of 1000.\n\nThe quiz uses a fixed bank of curated questions seeded by the run, so the order is reproducible. Replays draw from the same pool but in seeded order. Aim for a perfect score of 1000 by knowing the topic well.\n\nSingle-player only — no CPU. A great two-minute brain workout for fans of the topic. Compare scores across multiple runs to track your trivia mastery. The quiz is intentionally short for snackable play sessions, ideal for filling small breaks with focused recall practice.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state: GeekOutQuizState): HintTarget | null => (state.phase as string) === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: GeekOutQuiz,
};
