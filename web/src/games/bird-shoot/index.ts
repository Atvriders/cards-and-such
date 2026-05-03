import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BirdShootState, BirdShootAction, BirdShootSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BirdShoot = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BirdShoot as unknown as React.ComponentType<unknown> })));
const birdShootPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof birdShootPluginSettings>;

export const birdShootPlugin: GamePlugin<BirdShootState, BirdShootAction, typeof birdShootPluginSettings> = {
  id: "bird-shoot",
  title: "Bird Shoot",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Birds are flying across the sky! Click them to tag them — let none get past you!",
  howToPlay: `Bird Shoot is a clicking game where birds fly across the screen. Unlike falling games, birds cross from left to right (or appear at random). Click each bird before it flies off the edge of the arena!

A standard bird earns 10 points. An eagle (large and fast) earns 20 points — prioritize those if you can! Any bird that escapes off-screen costs one life.

You start with 3 lives. Lose all three and the game ends. The game also ends when the timer runs out.

New birds appear every two seconds. Birds move quickly — you need sharp eyes and fast clicks to tag them all.

Use Settings to choose 20, 30, or 45 seconds. Final score, tagged count, and escape count are displayed at the end. Can you tag every bird for a perfect score?`,
  settings: birdShootPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as BirdShootSettings),
  reducer, isTerminal,
    hint: (state: BirdShootState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-bird-shoot-action"]', pulses: 3 };
    },
  component: BirdShoot,
};
