import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LightningRoundState, LightningRoundAction, LightningRoundSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LightningRound } from "./Game.js";

const settings = {
  timeLimit: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["60", "90", "120"] as const,
    default: "60" as const,
  },
} as const;

export const lightningRoundPlugin: GamePlugin<LightningRoundState, LightningRoundAction, typeof settings> = {
  id: "lightning-round",
  title: "Lightning Round",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Answer 30 multiple-choice trivia questions against the clock. No penalty for wrong answers — just be fast!",
  howToPlay: `Lightning Round is a rapid-fire trivia game. The clock starts as soon as you press Start. You have 60, 90, or 120 seconds (choose in settings) to work through 30 multiple-choice questions spanning geography, science, math, history, sports, and more.

Each question has four answer options. Click the button that matches your answer. If correct, you score 1 point and move straight to the next question. Wrong answers score zero points — there is no penalty — but you still advance to the next question automatically. Speed is everything: every second you spend on a hard question is a second you cannot spend on an easy one.

The timer ticks down constantly. When it hits zero, the game ends immediately even if you have unanswered questions remaining. Your final score is the number of correct answers you accumulated.

Strategy tips: skip mentally if you are stuck — a quick wrong click beats losing three seconds. Easy questions at the start of your 30-question set are worth the same as hard ones at the end, so stay calm and consistent. Scoring 20+ on the 60-second version is excellent; 25+ is expert-level. Questions are shuffled each game, so every play-through feels fresh.`,
  settings,
  initialState: (seed: number, s: LightningRoundSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: LightningRound,
} as unknown as GamePlugin;
