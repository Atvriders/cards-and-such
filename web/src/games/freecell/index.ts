import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FreeCellState, FreeCellAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FreeCell } from "./FreeCell.js";

export const freecellSettings = {
  freeCells: {
    kind: "number" as const,
    label: "Free Cells",
    min: 4,
    max: 4,
    step: 1,
    default: 4,
  },
} as const;

type FreeCellSettings = SettingsOf<typeof freecellSettings>;

export const freecellPlugin: GamePlugin<FreeCellState, FreeCellAction, typeof freecellSettings> = {
  id: "freecell",
  title: "FreeCell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic FreeCell — move all cards to foundations using free cells as buffers.",
  settings: freecellSettings,
  initialState: (seed: number, settings: FreeCellSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FreeCell,
};
