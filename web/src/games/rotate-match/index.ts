import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RotateMatchState, RotateMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RotateMatch } from "./RotateMatch.js";

export const rotateMatchSettings = {
  moves: {
    kind: "enum" as const,
    label: "Max Moves",
    options: ["20", "30", "40"] as const,
    default: "30" as const,
  },
} as const;

type RotateMatchSettingsType = SettingsOf<typeof rotateMatchSettings>;

export const rotateMatchPlugin: GamePlugin<RotateMatchState, RotateMatchAction, typeof rotateMatchSettings> = {
  id: "rotate-match",
  title: "Rotate Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rotate 2×2 blocks of tiles to line up three or more of the same color. Score as many matches as you can within the move limit.",
  howToPlay: `Rotate Match is played on a 6×6 grid of colored tiles. Every move, you choose a 2×2 block anywhere on the grid and rotate its four tiles either clockwise or counterclockwise.

Left-click on any tile to rotate the 2×2 block whose top-left corner is at the nearest valid position — the hovered block is highlighted to show you exactly which four tiles will rotate. Right-click to rotate the same block in the opposite direction.

After each rotation, the board automatically checks for lines of three or more matching tiles horizontally or vertically. Any matching runs are cleared and new random tiles drop into those positions. You score 10 points per tile cleared.

You have a limited number of moves (30 by default). Unlike swap-based match-3 games, you can always make a rotation — it is up to you whether it creates a match. Rotations that do not produce matches still cost a move, so plan carefully.

Strategy: set up long runs by aligning partial rows before committing to the final rotation that clears them. Look for tiles that are almost in line and need just one rotation to connect. Clearing large groups in a single rotation is key to a high score.`,
  settings: rotateMatchSettings,
  initialState: (seed: number, settings: RotateMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".rotatematch-board")) ? { selector: ".rotatematch-board", pulses: 3 } : null,
  component: RotateMatch,
};
