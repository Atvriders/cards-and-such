import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TileFlipState, TileFlipAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TileFlip } from "./Game.js";

export const tileFlipSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
} as const;

type TileFlipSettingsType = SettingsOf<typeof tileFlipSettings>;

export const tileFlipPlugin: GamePlugin<TileFlipState, TileFlipAction, typeof tileFlipSettings> = {
  id: "tile-flip",
  title: "Tile Flip",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip tiles to match the target color pattern using the fewest moves.",
  howToPlay: `Match your board to the target pattern by clicking tiles. Each click cycles the clicked tile and its four orthogonal neighbors through four colors.

The board on the left is yours to interact with. The board on the right shows the target pattern you must replicate. Click any tile to advance it and its neighbors one step through the color cycle: red → blue → yellow → green → red.

Your goal is to make every tile on your board show the same color as the corresponding tile on the target board. There is no move limit, but your score depends on how few clicks you used.

Score formula: max(100, 1000 − moves × 20). A 3×3 grid is the simplest challenge, 5×5 is the hardest.

Strategy: Because each flip cycles through four colors, clicking a cell four times returns it to its original state. Work row by row from top to bottom using a "chase" technique — fix the top row first, then use that to guide the remaining rows. Pay attention to how neighbors interact: fixing one cell may affect several others nearby.`,
  settings: tileFlipSettings,
  initialState: (seed: number, settings: TileFlipSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TileFlip,
};
