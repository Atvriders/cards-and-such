import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SafeDriverState, SafeDriverAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SafeDriver = /* @__PURE__ */ lazy(() => import("./SafeDriver.js").then((mod) => ({ default: mod.SafeDriver as unknown as React.ComponentType<unknown> })));
export const safeDriverSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal",
  },
} as const;

type SafeDriverSettingsType = SettingsOf<typeof safeDriverSettings>;

export const safeDriverPlugin: GamePlugin<SafeDriverState, SafeDriverAction, typeof safeDriverSettings> = {
  id: "safe-driver",
  title: "Safe Driver",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dodge road hazards as long as you can.",
  howToPlay: `Safe Driver is a reflex-based arcade game where you control a car speeding down a three-lane highway. Obstacles appear at the top and scroll downward — your job is to swerve left or right to avoid them.

Use the Arrow Left and Arrow Right keys, or the on-screen buttons, to switch lanes. Your car sits near the bottom of the road. Obstacles fall at a steady pace; as your distance grows they spawn more frequently.

You start with three lives. Each time an obstacle reaches your lane and collides with your car, you lose one life and the obstacle is cleared. The game ends when all three lives are gone.

Settings: Speed controls how fast obstacles move — Slow gives more reaction time, Fast demands quick reflexes.

Scoring: your final score equals your distance driven (capped at 100). Survive as long as possible to set a high score. Watch multiple lanes at once — sometimes back-to-back obstacles line up on the same lane, so be ready to switch quickly.

Tip: stay in the middle lane when possible — it gives you the most options to dodge in either direction.`,
  settings: safeDriverSettings,
  initialState: (seed: number, settings: SafeDriverSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-safe-driver-action"]', pulses: 3 }; },
  component: SafeDriver,
};
