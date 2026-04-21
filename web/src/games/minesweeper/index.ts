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
  settings: minesweeperSettings,
  initialState: (seed: number, settings: MinesweeperSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  component: Minesweeper,
};
