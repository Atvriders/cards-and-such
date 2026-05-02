import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
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
  hint: (state: MinesweeperState): HintTarget | null => {
    if (state.won || state.lost) return null;
    // Before first move: pulse the center cell.
    if (state.firstMove || !state.adj) {
      const idx = Math.floor(state.rows / 2) * state.cols + Math.floor(state.cols / 2);
      return { selector: `[data-testid="hint-target-minesweeper-${idx}"]`, pulses: 3 };
    }
    const adj = state.adj;
    const cells = state.state;
    // Find a hidden cell adjacent to a revealed 0 (guaranteed safe).
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const i = r * state.cols + c;
        if (cells[i] !== "hidden") continue;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) continue;
            const ni = nr * state.cols + nc;
            if (cells[ni] === "revealed" && adj[ni] === 0) {
              return { selector: `[data-testid="hint-target-minesweeper-${i}"]`, pulses: 3 };
            }
          }
        }
      }
    }
    // Fallback: first hidden cell.
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === "hidden") {
        return { selector: `[data-testid="hint-target-minesweeper-${i}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: Minesweeper,
};
