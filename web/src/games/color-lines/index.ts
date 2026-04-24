import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorLinesState, ColorLinesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColorLines } from "./ColorLines.js";

export const colorLinesSettings = {
  size: {
    kind: "enum" as const,
    label: "Board Size",
    options: ["7", "9"] as const,
    default: "9" as const,
  },
} as const;

type ColorLinesSettingsType = SettingsOf<typeof colorLinesSettings>;

export const colorLinesPlugin: GamePlugin<ColorLinesState, ColorLinesAction, typeof colorLinesSettings> = {
  id: "color-lines",
  title: "Color Lines",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move colored balls to form lines of 5 or more. Each turn spawns three new balls — keep the board clear as long as possible.",
  howToPlay: `The board starts with a handful of colored balls scattered across a 9×9 grid. Three small circles above the board preview the colors that will appear on your next turn.

To make a move, click a ball to select it (it lights up with a white border), then click an empty cell to move it there. The ball travels along any open path — if the destination is completely blocked by other balls, the move is rejected.

After you move a ball, check if five or more balls of the same color now form a line — horizontal, vertical, or diagonal. Matching lines are automatically cleared and you score 10 points per ball removed. If you clear a line, no new balls spawn that turn, giving you a chance to chain more moves.

If your move does not create a line, three new balls appear in random empty cells in the colors previewed earlier. The game ends when the board fills completely.

Strategy: plan ahead using the preview. Try to keep paths open so you can move balls freely. Diagonal lines are easy to miss — watch for them when setting up big clears. Clearing 7+ balls at once gives the best scores.`,
  settings: colorLinesSettings,
  initialState: (seed: number, settings: ColorLinesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ColorLines,
};
