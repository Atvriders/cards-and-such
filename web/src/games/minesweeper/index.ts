import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MinesweeperState, MinesweeperAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Minesweeper } from "./Minesweeper.js";

export const minesweeperSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["beginner", "intermediate", "expert"] as const,
    default: "beginner" as const,
  },
} as const;

type MinesweeperSettingsType = SettingsOf<typeof minesweeperSettings>;

export const minesweeperPlugin: GamePlugin<
  MinesweeperState,
  MinesweeperAction,
  typeof minesweeperSettings
> = {
  id: "minesweeper",
  title: "Minesweeper",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Classic logic puzzle. Reveal safe cells, flag mines. Don't click a mine.",
  howToPlay: `Reveal every safe cell on the grid without detonating a hidden mine.

Left-click a cell to reveal it. If it shows a number, that number tells you how many of its eight neighboring cells contain mines — use this information to deduce which adjacent cells are safe. Right-click (or use flag mode) to place a flag on a cell you believe hides a mine, which prevents accidental clicks. Clicking a cell that contains a mine ends the game. Revealing a blank cell (zero adjacent mines) automatically reveals all connected blank cells and their numbered borders.

Your first click is always guaranteed safe — the board is arranged after that click. The game is won when all non-mine cells are revealed.

Difficulty sets the grid size and mine density: beginner is 9×9 with 10 mines, intermediate is 16×16 with 40 mines, and expert is 30×16 with 99 mines. Tips: Start near the center to open a large area. Use the number constraints together — if a "1" is satisfied by a known flag, all other neighbors are safe.`,
  settings: minesweeperSettings,
  initialState: (seed: number, settings: MinesweeperSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  component: Minesweeper,
};
