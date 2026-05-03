import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkeeBallState, SkeeBallAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SkeeBall = /* @__PURE__ */ lazy(() => import("./SkeeBall.js").then((mod) => ({ default: mod.SkeeBall as unknown as React.ComponentType<unknown> })));
export const skeeBallSettings = {
  balls: {
    kind: "enum" as const,
    label: "Balls",
    options: ["5", "9", "12"] as const,
    default: "9" as const,
  },
} as const;

type SkeeBallSettingsType = SettingsOf<typeof skeeBallSettings>;

export const skeeBallPlugin: GamePlugin<SkeeBallState, SkeeBallAction, typeof skeeBallSettings> = {
  id: "skee-ball",
  title: "Skee Ball",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll a ball up the alley and into the scoring rings. Time your throw to land in the 100-point bull's-eye!",
  howToPlay: `Roll up to the lane and take your position. A power bar swings back and forth automatically — when you press ROLL, it captures the current power and sends the ball rocketing up the lane and off the ramp into the target rings on the back wall.

The target has five concentric rings scored 10, 20, 40, 60, and 100 points from outer to inner. Each throw has a small random wobble to simulate imperfect technique, so even a perfect power reading has slight variation. The 100-point bull's-eye is tiny — it demands both excellent power timing and good lane positioning.

Use the Lane Offset slider before throwing to aim left or right. A centred lane aims straight for the bull's-eye; offset throws tend to land in outer rings and are harder to bull's-eye. Keep the lane centred and focus on power timing for maximum scores.

Ideal throw: power bar at about 70–85% when you release. Too low and the ball doesn't make it to the rings (0 points). Too high and it overshoots the back wall (also 0). The green power zone marks the sweet spot. Choose 5, 9, or 12 balls — a perfect game of 9 balls scores 900 points!`,
  settings: skeeBallSettings,
  initialState: (seed: number, settings: SkeeBallSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-skee-ball-action"]', pulses: 3 }; },
  component: SkeeBall,
};
