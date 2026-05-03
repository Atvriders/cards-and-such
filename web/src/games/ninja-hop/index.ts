import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NinjaHopState, NinjaHopAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NinjaHop = /* @__PURE__ */ lazy(() => import("./NinjaHop.js").then((mod) => ({ default: mod.NinjaHop as unknown as React.ComponentType<unknown> })));
export const ninjaHopSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type NinjaHopSettingsType = SettingsOf<typeof ninjaHopSettings>;

export const ninjaHopPlugin: GamePlugin<NinjaHopState, NinjaHopAction, typeof ninjaHopSettings> = {
  id: "ninja-hop",
  title: "Ninja Hop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hop upward from platform to platform as a nimble ninja. Don't fall!",
  howToPlay: `You are a ninja who must leap from platform to platform, climbing as high as possible without falling off the bottom of the screen.

Press Space or the Up arrow to jump. Use the Left and Right arrow keys (or A and D) to move sideways. On mobile, use the on-screen buttons below the game. The screen does not scroll down — if you fall below the bottom edge, the run ends immediately.

As you climb higher, the screen scrolls upward. New platforms appear at the top. Your score is based on the height you reach — the higher you climb, the more points you earn. Each platform has a different width: wider platforms are easy to land on; narrow ones demand precise jumps.

The key skill is timing your jumps carefully. Jump too early and you may not reach the next platform; jump too late and you will overshoot it. Landing near the edge of a platform does not cause a slip, so don't be afraid to graze the sides.

Three speed settings adjust how fast gravity and movement work. Slow gives plenty of air time; Fast makes the ninja zip quickly and fall steeply. Try to maintain a rhythm: jump, move, land, jump again without pausing too long on any single platform.`,
  settings: ninjaHopSettings,
  initialState: (seed: number, settings: NinjaHopSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".nh-player", pulses: 3 }; },
  component: NinjaHop,
};
