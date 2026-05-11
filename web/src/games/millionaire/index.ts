import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MillionaireState, MillionaireAction, MillionaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Millionaire = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Millionaire as unknown as React.ComponentType<unknown> })));
const settings = {
  lifelines: {
    kind: "enum" as const,
    label: "Lifelines",
    options: ["all", "none"] as const,
    default: "all" as const,
  },
} as const;

export const millionairePlugin: GamePlugin<MillionaireState, MillionaireAction, typeof settings> = {
  id: "millionaire",
  title: "Millionaire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Climb the 14-question prize ladder. Use lifelines wisely — one wrong answer drops you to the nearest safety net.",
  howToPlay: `Millionaire is a high-stakes trivia game modelled after the classic TV format. There are 14 questions, each more difficult than the last, with prizes ranging from $100 to $1,000,000. Every question is multiple-choice with four options labelled A, B, C, and D.

Answer correctly to advance to the next question and lock in a higher prize. Miss a question and you fall back to the nearest safety net: $1,000 after question 4 and $32,000 after question 9. If you haven't reached the first safety net and you get it wrong, you walk away with nothing.

Three lifelines are available (when enabled):
- 50:50 — eliminates two of the three wrong answers, leaving only one wrong and the correct one.
- Ask the Audience — shows a simulated percentage of how the audience would vote on each option. The audience is usually (but not always) right.
- Phone a Friend — your friend gives their best guess. They are correct about 75% of the time but sometimes lead you astray.

Each lifeline can be used only once per game. You may also Walk Away at any time to bank your current prize and end the game safely.

The game ends when you answer all 14 questions correctly ($1,000,000), answer one incorrectly (drop to safety net), or choose to walk away.`,
  settings,
  initialState: (seed: number, s: MillionaireSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  
  hint: (state: MillionaireState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-millionaire-answer-0"]', pulses: 3 } : null,component: Millionaire,
};
