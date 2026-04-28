import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { YinYangPuzzleState, YinYangPuzzleAction, YinYangPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YinYangPuzzleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const yinYangPuzzlePlugin: GamePlugin<YinYangPuzzleState, YinYangPuzzleAction, typeof settings> = {
  id: "yin-yang-puzzle",
  title: "Yin-Yang Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Color cells black or white. No 2x2 monochrome block; all same-color cells must form a connected group.",
  howToPlay: "Yin-Yang fills every cell with either black or white. Two rules: (1) no 2x2 square may be entirely one color, and (2) all cells of each color must form one connected group (orthogonal adjacency).\n\nConnectivity for both colors is the heart of the puzzle. A black cell isolated by white means the puzzle is unsolvable. The 2x2 rule meanwhile bans large monochrome blobs, so the colors weave through each other in intricate paths.\n\nEach puzzle shows a small grid with some cells pre-colored. A target cell is highlighted with four candidate values: black, white, or distractors. Apply the connectivity and 2x2 rules to find the unique correct color.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong picks reveal the correct color. Yin-Yang's elegance comes from how a global connectivity rule turns small grids into careful balance puzzles. Easy to learn, satisfying to solve.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as YinYangPuzzleSettings),
  reducer,
  isTerminal,
  component: YinYangPuzzleGame,
};
