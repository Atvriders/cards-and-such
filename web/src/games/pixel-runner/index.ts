import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PixelRunnerState, PixelRunnerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PixelRunner = /* @__PURE__ */ lazy(() => import("./PixelRunner.js").then((mod) => ({ default: mod.PixelRunner as unknown as React.ComponentType<unknown> })));
export const pixelRunnerSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["normal", "fast", "turbo"] as const,
    default: "normal" as const,
  },
} as const;

type PixelRunnerSettingsType = SettingsOf<typeof pixelRunnerSettings>;

export const pixelRunnerPlugin: GamePlugin<PixelRunnerState, PixelRunnerAction, typeof pixelRunnerSettings> = {
  id: "pixel-runner",
  title: "Pixel Runner",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Endless runner — jump over obstacles to survive as long as possible.",
  howToPlay: `Run endlessly through a scrolling landscape and jump over every obstacle in your path. Your pixel character moves automatically — your only control is when to jump.

Press Space, the Up Arrow, or W to leap into the air. Time your jumps carefully: short red barriers need just a small hop, while tall double-height barriers require you to jump earlier and hold on through the arc.

Score accumulates every tick your character stays alive. Faster speed settings increase score gain but give you less reaction time between obstacles. Obstacles appear at random intervals and heights, so stay alert even on quiet stretches.

You only have one chance — there are no lives or checkpoints. The moment you clip an obstacle the run ends and your final score is recorded.

Strategy tips: Jump the instant an obstacle enters your peripheral view at fast and turbo speeds. On normal speed you can wait until the obstacle is closer. Avoid panic-jumping too early, as you may land on a subsequent obstacle. Keep your eyes on the leading edge of the canvas for incoming threats.`,
  settings: pixelRunnerSettings,
  initialState: (seed: number, settings: PixelRunnerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pixel-runner-action"]', pulses: 3 }; },
  component: PixelRunner,
};
