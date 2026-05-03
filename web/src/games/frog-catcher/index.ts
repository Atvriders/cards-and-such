import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrogCatcherState, FrogCatcherAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FrogCatcher = /* @__PURE__ */ lazy(() => import("./FrogCatcher.js").then((mod) => ({ default: mod.FrogCatcher as unknown as React.ComponentType<unknown> })));
export const frogCatcherSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "120"] as const,
    default: "60" as const,
  },
  flySpeed: {
    kind: "enum" as const,
    label: "Fly Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type FrogCatcherSettingsType = SettingsOf<typeof frogCatcherSettings>;

export const frogCatcherPlugin: GamePlugin<FrogCatcherState, FrogCatcherAction, typeof frogCatcherSettings> = {
  id: "frog-catcher",
  title: "Frog Catcher",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click to flick the frog's tongue and catch flies before time runs out.",
  howToPlay: `A frog sits on a lily pad at the bottom of the screen. Flies buzz around the pond above it. Click anywhere on the screen to shoot the frog's tongue toward that point. If the tongue tip touches a fly, it's caught and you earn one point.

The tongue extends toward your click target then automatically retracts. You cannot fire again while the tongue is in motion, so aim carefully — a missed shot leaves you defenseless for about half a second. New flies spawn onto the pond every second or so, up to five flies at once, and they bounce around the walls.

The game lasts 30, 60, or 120 seconds. Fly speed controls how fast the insects zip around. On slow they drift lazily, making aiming straightforward. On medium they move at a brisk pace and change direction at the walls. On fast they dart around rapidly, demanding you predict where a fly will be when your tongue arrives.

Tips: Don't click where a fly is right now — click slightly ahead of its path to intercept it. The tongue travels at a fixed speed, so closer targets are caught faster. When multiple flies cluster together, aim for the densest group. On fast mode, it helps to keep your cursor pre-positioned near the frog's expected strike zone rather than chasing individual flies across the screen.`,
  settings: frogCatcherSettings,
  initialState: (seed: number, settings: FrogCatcherSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FrogCatcher,
};
