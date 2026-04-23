import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type NumberMazeState, type NumberMazeAction } from "./state.js";
import { NumberMaze } from "./NumberMaze.js";

export const numberMazeSettings = {
  puzzle: {
    kind: "enum" as const,
    label: "Puzzle",
    options: ["1", "2", "3", "4", "5"] as const,
    default: "1" as const,
  },
} as const;

export const numberMazePlugin: GamePlugin<NumberMazeState, NumberMazeAction, typeof numberMazeSettings> = {
  id: "number-maze",
  title: "Number Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a grid using the numbers on each cell. Reach the EXIT within the turn limit!",
  howToPlay: `Number Maze is a logic puzzle played on a grid. Each cell contains a number that tells you exactly how many steps you must move from it. Your goal is to reach the EXIT cell within a limited number of turns.

You always move in one of four orthogonal directions: up, down, left, or right. The number on your current cell determines how far you jump — you cannot stop partway through. For example, if you are on a cell showing 3, you must move exactly 3 cells in a chosen direction. You cannot move if the landing cell would fall off the grid.

The EXIT cell is shown in green. Land on it to win! If you use all your turns without reaching the EXIT, the game ends in failure.

Scoring: solving the puzzle scores 300 base points, plus 20 bonus points for each turn you saved below the limit. Solving a 10-turn puzzle in 7 turns scores 300 + 60 = 360.

Five puzzles of increasing difficulty are included, from 4×4 Beginner to 6×6 Expert. Each puzzle has a known solution — they are all solvable with careful planning.

Strategy: trace the path backwards from EXIT to find where you need to be one move away. Work out the chain of moves that leads there. Visiting a cell you have already been on is allowed — sometimes backtracking is necessary.`,
  settings: numberMazeSettings,
  initialState,
  reducer,
  isTerminal,
  component: NumberMaze,
};
