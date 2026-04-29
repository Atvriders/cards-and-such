import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { Drawful2QuizState, Drawful2QuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Drawful2Quiz } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const drawful2QuizPlugin: GamePlugin<Drawful2QuizState, Drawful2QuizAction, typeof settings> = {
  id: "drawful-2-quiz",
  title: "Drawful 2 Quiz",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drawing prompts party trivia.",
  howToPlay: "Drawful 2 Quiz is a quick trivia quiz with ten multiple-choice questions. Drawing prompts party trivia. Each question has four answer options; pick the one you think is correct.\n\nSpecial context: 10 trivia questions about Drawful 2 prompts and rules.\n\nClick the answer button you believe is right. The correct answer is highlighted instantly and your score updates. A correct answer earns you 100 points; incorrect answers earn nothing. After ten questions your final score is shown out of 1000.\n\nThe quiz uses a fixed bank of curated questions seeded by the run, so the order is reproducible. Replays draw from the same pool but in seeded order. Aim for a perfect score of 1000 by knowing the topic well.\n\nSingle-player only — no CPU. A great two-minute brain workout for fans of the topic. Compare scores across multiple runs to track your trivia mastery. The quiz is intentionally short for snackable play sessions, ideal for filling small breaks with focused recall practice.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: Drawful2Quiz,
};
