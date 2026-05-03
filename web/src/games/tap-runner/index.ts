import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TapRunnerState, TapRunnerAction, TapRunnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TapRunnerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TapRunnerGame as unknown as React.ComponentType<unknown> })));
export const tapRunnerSettings = {} as const;

export const tapRunnerPlugin: GamePlugin<
  TapRunnerState,
  TapRunnerAction,
  typeof tapRunnerSettings
> = {
  id: "tap-runner",
  title: "Tap Runner",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Auto-runner with tap-to-jump and hold-to-glide. Avoid the obstacles!",
  howToPlay: `Your runner moves automatically from left to right at increasing speed. Obstacles appear from the right side and you must react quickly to clear them.

A single tap (Space, Up arrow, canvas tap, or button) makes your runner jump off the ground. Short obstacles only need a brief jump. But if you hold the tap, your runner glides with greatly reduced gravity — useful for clearing taller red obstacles that require staying airborne longer.

There are two obstacle types: shorter orange blocks that a quick jump clears easily, and taller red blocks that require you to hold for a sustained glide over the top. Learn to read the obstacle type quickly as it approaches so you can choose the right response.

You cannot jump again while airborne — only one jump at a time. Time your jumps so you land before the next obstacle arrives. If you jump too early you might land right into the next block.

Speed increases continuously, so what starts as a leisurely jog becomes a sprint requiring very fast reactions. Score is distance traveled in meters. There is no ceiling, so you can jump as high as you like, but every second on the ground is a second of forward progress.`,
  settings: tapRunnerSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: TapRunnerState): HintTarget | null => (!state.over ? { selector: ".arcade-btn", pulses: 3 } : null), component: TapRunnerGame,
};
