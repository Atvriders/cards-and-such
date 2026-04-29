import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TridokuMiniState, TridokuMiniStateAction, TridokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TridokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const tridokuMiniPlugin: GamePlugin<TridokuMiniState, TridokuMiniStateAction, typeof settings> = {
  id: "tridoku-mini",
  title: "Tridoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Triangular Sudoku variant. Place digits in triangular cells.",
  howToPlay: "Tridoku is the triangular cousin of Sudoku. The grid is a large equilateral triangle subdivided into smaller triangles, each forming a cell. Standard Tridoku uses 1 to 9 with constraints across the three side lines, three medians, and nine triangular regions.\n\nThis Mini version uses 1 to 4 on a smaller triangle to make the rules approachable. Three rules: each side line uses each digit, each medial line uses each digit, and each region (a small set of triangular cells) uses each digit. The visual grid prefills several digits and highlights one missing cell.\n\nSix puzzles per round; 100 points per correct answer. Tridoku helps train pattern recognition along non-rectilinear axes — the triangle constraint can be subtle, but Mini's small board keeps the puzzles solvable in seconds. Choose the right digit for the marked triangle from four options.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as TridokuMiniSettings),
  reducer,
  isTerminal,
  component: TridokuMiniGame,
};
