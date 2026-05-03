import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { ConnectLightsState, ConnectLightsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectLights = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectLights as unknown as React.ComponentType<unknown> })));
export const connectLightsSettings = {
  moves: {
    kind: "enum" as const,
    label: "Moves",
    options: ["20", "30", "50"] as const,
    default: "30" as const,
  },
} as const;

type ConnectLightsSettingsType = SettingsOf<typeof connectLightsSettings>;

export const connectLightsPlugin: GamePlugin<ConnectLightsState, ConnectLightsAction, typeof connectLightsSettings> = {
  id: "connect-lights",
  title: "Connect Lights",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swap adjacent colored lights to create connected paths of 3 or more same-color!",
  howToPlay: `Connect Lights is a colorful puzzle game played on a 6×6 grid of glowing lights in five colors. Unlike standard match-3 games that only count straight lines, Connect Lights rewards you for creating connected PATHS — any group of 3 or more same-color lights that touch each other (horizontally or vertically) counts as a match!

To play, click a light to select it (it will glow), then click an adjacent light to swap them. If the swap creates any connected group of 3 or more same-color lights anywhere on the grid, those lights are cleared and you score points! If the swap does not create a valid group, the swap is cancelled.

Scoring: a group of 3 earns 15 points, 4 earns 40, 5 earns 100, and larger groups score even more. Cascades — when cleared lights cause new groups to form after gravity drops lights down — earn bonus multiplier points!

After lights are cleared, the remaining lights fall downward and new random lights fill the top. Look for opportunities to set up chain reactions!

Choose from 20, 30, or 50 moves. Plan carefully — think about how swapping one pair might create a large connected cluster rather than just a simple line. The path-based rule opens up new strategies not possible in regular match-3!`,
  settings: connectLightsSettings,
  initialState: (seed: number, settings: ConnectLightsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".cl-lights-grid")) ? { selector: ".cl-lights-grid", pulses: 3 } : null,
  component: ConnectLights,
};
