import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BubbleShooterState, BubbleShooterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BubbleShooter = /* @__PURE__ */ lazy(() => import("./BubbleShooter.js").then((mod) => ({ default: mod.BubbleShooter as unknown as React.ComponentType<unknown> })));
export const bubbleShooterSettings = {
  colors: {
    kind: "enum" as const,
    label: "Colors",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
} as const;

type BubbleShooterSettingsType = SettingsOf<typeof bubbleShooterSettings>;

export const bubbleShooterPlugin: GamePlugin<BubbleShooterState, BubbleShooterAction, typeof bubbleShooterSettings> = {
  id: "bubble-shooter",
  title: "Bubble Shooter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aim and shoot colored bubbles. Three in a row pops them. Clear the board.",
  howToPlay: `Shoot colored bubbles from the bottom of the screen to clear the grid. Use the angle slider to aim and press Shoot (or use the button). When a fired bubble lands next to two or more bubbles of the same color, all three or more connected same-color bubbles pop. Any bubbles left floating with no connection to the top also fall away.

The goal is to clear all bubbles from the board. You win when the grid is completely empty. You lose if bubbles reach the bottom dead zone. Your score is based on how few shots you needed — fewer shots means a higher score.

The board is a rectangular grid, 9 columns wide and 6 rows tall at the start. The current bubble waiting to be fired is shown below the grid. Aim angle ranges from −80° (far left) to +80° (far right), with 0° shooting straight up.

Choose the number of colors (3, 4, or 5). Fewer colors make it easier to form groups of 3+. More colors increase the challenge because matching groups are harder to find.

Tips: Start by targeting existing clusters of the same color near the top to create chain reactions. A single well-placed shot can pop a large cluster and drop many floating bubbles at once. Plan several shots ahead by looking at which color clusters are easiest to reach.`,
  settings: bubbleShooterSettings,
  initialState: (seed: number, settings: BubbleShooterSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
    hint: (state: BubbleShooterState) => {
      if (isTerminal(state)) return null;
      return { selector: '[data-testid="hint-target-bubble-shooter-action"]', pulses: 3 };
    },
  component: BubbleShooter,
};
