import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { HexadokuMiniState, HexadokuMiniStateAction, HexadokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HexadokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const hexadokuMiniPlugin: GamePlugin<HexadokuMiniState, HexadokuMiniStateAction, typeof settings> = {
  id: "hexadoku-mini",
  title: "Hexadoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hexagonal Sudoku variant. Place digits across three axes.",
  howToPlay: "Hexadoku is Sudoku on a hexagonal grid. Where standard Sudoku has rows and columns, Hexadoku has three intersecting line directions running across the hexagon. Each direction must contain each digit exactly once. Some variants add hexagonal regions for a third constraint.\n\nThis Mini version uses a small hexagonal arrangement of cells with digits 1 to 4 along each of three axes. The visual layout prefills cells and asks for one missing value, presenting four lettered candidates.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point time bonus per second. Hexadoku trains thinking across non-rectangular axes — once you see the three directions overlapping, the puzzles unlock. The catch: a single cell sits on three constraints simultaneously, so checking each axis usually pins the answer fast. Choose carefully.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as HexadokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: HexadokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-hexadoku-mini-answer-0"]', pulses: 3 } : null,component: HexadokuMiniGame,
};
