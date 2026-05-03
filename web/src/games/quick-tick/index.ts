import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { QuickTickState, QuickTickAction, QuickTickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuickTickGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuickTickGame as unknown as React.ComponentType<unknown> })));
export const quickTickSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const quickTickPlugin: GamePlugin<QuickTickState, QuickTickAction, typeof quickTickSettings> = {
  id: "quick-tick",
  title: "Quick Tick",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your reflexes — tap the clock exactly when it ticks and score points for accuracy.",
  howToPlay: `Quick Tick is a reflex accuracy game. Your goal is to tap a clock target at precisely the right moment — exactly when the progress bar fills up and the clock "ticks."

The game consists of 20 ticks. On each tick, a progress bar fills from left to right over one second. When it reaches full, the clock flashes to signal the tick moment. Your job is to click or tap the clock as close to that exact moment as possible.

Scoring is based on how close your tap is to the tick:
- Within 50 milliseconds: Perfect — +10 points
- Within 150 milliseconds: Good — +5 points
- Outside 150 milliseconds or a miss: +0 points

The maximum possible score is 200 points (20 perfect taps × 10 points each). After all 20 ticks your total score is shown.

Tips: Try to anticipate the tick rather than reacting to it — reaction time averages 150–250ms, so you need to act slightly before you see the flash. With practice, the rhythm becomes predictable and your accuracy will improve. Good luck!`,
  settings: quickTickSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: QuickTickState): HintTarget | null => state.phase !== "done" ? { selector: '.quick-tick', pulses: 3 } : null,
  component: QuickTickGame,
};
