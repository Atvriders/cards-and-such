import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EggCatcherState, EggCatcherAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EggCatcher = /* @__PURE__ */ lazy(() => import("./EggCatcher.js").then((mod) => ({ default: mod.EggCatcher as unknown as React.ComponentType<unknown> })));
export const eggCatcherSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5", "7"] as const,
    default: "3" as const,
  },
} as const;

type EggCatcherSettingsType = SettingsOf<typeof eggCatcherSettings>;

export const eggCatcherPlugin: GamePlugin<EggCatcherState, EggCatcherAction, typeof eggCatcherSettings> = {
  id: "egg-catcher",
  title: "Egg Catcher",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move the basket to catch falling eggs before they smash on the ground.",
  howToPlay: `Eggs fall from the sky at random positions. Move your basket left and right to catch them before they hit the ground.

Move the basket by moving your mouse across the play area, or drag your finger on touch screens. Every egg you catch earns one point. If an egg reaches the ground without landing in your basket, you lose a life. Lose all lives and the game ends.

The game gets progressively harder as your score rises. Each time you earn ten more points a new level begins — eggs fall faster and spawn more frequently, so staying alert is essential. Three speed settings are available: slow gives you more reaction time, medium is the standard experience, and fast is for expert players.

You start with 3, 5, or 7 lives depending on your chosen setting. More lives let you afford a few misses before the run ends. Try to keep the basket centered and make small corrections rather than large sweeping moves — most eggs fall near the middle of the field.

Tips: Anticipate where the next egg will fall rather than reacting at the last moment. At higher levels multiple eggs can be in the air at once, so prioritize the one closest to the ground. Stay calm and keep your motion smooth.`,
  settings: eggCatcherSettings,
  initialState: (seed: number, settings: EggCatcherSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".ec-basket", pulses: 3 }; },
  component: EggCatcher,
};
