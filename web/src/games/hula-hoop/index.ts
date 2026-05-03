import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HulaHoopState, HulaHoopAction, HulaHoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HulaHoop = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HulaHoop as unknown as React.ComponentType<unknown> })));
const hulaHoopPluginSettings = {
  duration: { kind: "enum" as const, label: "Duration (seconds)", options: ["20", "30", "45"] as const, default: "30" as const },
} as const;

type S = SettingsOf<typeof hulaHoopPluginSettings>;

export const hulaHoopPlugin: GamePlugin<HulaHoopState, HulaHoopAction, typeof hulaHoopPluginSettings> = {
  id: "hula-hoop",
  title: "Hula Hoop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hula hoops are dropping! Click them to spin them before they hit the ground — keep the fun going!",
  howToPlay: `Hula Hoop is a colorful catching arcade game. Hula hoops drop from the top of the screen at random positions. Click each hoop to spin it before it hits the ground!

A standard hoop earns 10 points. A double hoop (two hoops, faster-moving) is worth 20 points — snag those quickly for bigger points! Every hoop that hits the floor costs one life.

You start with 3 lives. Lose all three and the game ends. The timer also ends the game when it runs out.

New hoops drop every two seconds. Up to 6 can be falling at once, so keep scanning the arena and clicking fast!

Use Settings to choose 20, 30, or 45 seconds. Final score, hoops caught, and hoops missed are shown at the end. Can you keep every hoop spinning?`,
  settings: hulaHoopPluginSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as HulaHoopSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-hula-hoop-action"]', pulses: 3 }; },
  component: HulaHoop,
};
