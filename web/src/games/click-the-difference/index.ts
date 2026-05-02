import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClickDiffState, ClickDiffAction, ClickDiffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClickTheDifferenceGame } from "./Game.js";

export const clickTheDifferenceSettings = {
  variation: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["subtle", "obvious"] as const,
    default: "obvious" as const,
  },
} as const;

type CTDSettingsType = SettingsOf<typeof clickTheDifferenceSettings>;

function coerce(s: CTDSettingsType): ClickDiffSettings {
  return { variation: s.variation };
}

export const clickTheDifferencePlugin: GamePlugin<
  ClickDiffState,
  ClickDiffAction,
  typeof clickTheDifferenceSettings
> = {
  id: "click-the-difference",
  title: "Click the Difference",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Two 4x4 emoji grids. They are identical except for one cell. Click the different cell on the right grid. 10 rounds.",
  howToPlay:
    "Two 4x4 emoji grids appear side by side. The two grids are identical except for exactly one cell that differs in the right grid.\n\nClick the differing cell on the right grid as quickly as you can. Each correct round earns up to 10 points; every wrong click within a round subtracts 2 points (minimum reward 1).\n\nThe game lasts 10 rounds. Your final score is the sum of all rounds.",
  settings: clickTheDifferenceSettings,
  initialState: (seed: number, s: CTDSettingsType) => initialState(seed, coerce(s)),
  reducer,
  isTerminal,
  component: ClickTheDifferenceGame,
};
