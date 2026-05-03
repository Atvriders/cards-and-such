import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { DontBreakState, DontBreakAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DontBreakIce = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DontBreakIce as unknown as React.ComponentType<unknown> })));
export const dontBreakIceSettings = {
  dummy: {
    kind: "enum" as const,
    label: "Mode",
    options: ["yes"] as const,
    default: "yes" as const,
  },
} as const;

type DontBreakSettingsType = SettingsOf<typeof dontBreakIceSettings>;

export const dontBreakIcePlugin: GamePlugin<DontBreakState, DontBreakAction, typeof dontBreakIceSettings> = {
  id: "dont-break-ice",
  title: "Don't Break the Ice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap ice cubes to remove them without toppling the penguin's 4 support cubes!",
  howToPlay: `Don't Break the Ice is a tense kids game of careful removal. The playing field is a 4×4 grid of 16 ice cubes. A penguin sits safely in the middle, supported by the 4 central cubes (the inner 2×2 square, marked in cyan).

You and the bot take turns removing one ice cube per turn. Click any cube to remove it. If the last of the 4 penguin support cubes is removed, the penguin falls — and whoever removed that last support cube loses!

Strategy tip: try to avoid clicking on the 4 glowing center cubes as long as possible. Force the bot into removing them by clearing everything else first. The bot uses a simple strategy of preferring safe (non-support) cubes, so it will eventually have to tap the dangerous ones too.

The game ends when all 4 support cubes have been removed. If you knock the last support cube out, you lose (score 0). If the bot does it, you win (score 100).

The highlighted blue cubes in the center are the 4 danger squares — the penguin's supports. Tap carefully around the edges and corners first to stay safe!`,
  settings: dontBreakIceSettings,
  initialState: (seed: number, settings: DontBreakSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".dbi-grid")) ? { selector: ".dbi-grid", pulses: 3 } : null,
  component: DontBreakIce,
};
