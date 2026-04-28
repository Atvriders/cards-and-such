import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConwayState, ConwayAction, ConwaySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GameOfLifeConwayGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gameOfLifeConwayPlugin: GamePlugin<ConwayState, ConwayAction, typeof settings> = {
  id: "game-of-life-conway",
  title: "Game of Life (Conway)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Conway's Game of Life on an 8x8 grid. Toggle cells, step generations, and watch patterns evolve.",
  howToPlay: `Conway's Game of Life is the most famous cellular automaton ever invented. This is a one-player interactive sim, not a quiz.

Rules of survival on the 8x8 grid:
— A live cell with 2 or 3 live neighbors stays alive.
— A live cell with fewer than 2 (lonely) or more than 3 (crowded) dies.
— A dead cell with exactly 3 live neighbors becomes alive.

How to play:
1. Click any cell to toggle it on or off, or press a preset button (Glider, Blinker, Random) to seed a starting pattern.
2. Press Step to advance one generation. Watch live cells appear, propagate, oscillate, or die out.
3. Press Reset to clear the grid back to empty.
4. Press Finish to end your run and lock in your score.

Your final score is the sum of live cells across every generation, plus 2 points per generation. The longer you keep activity alive, the higher you score. A well-placed glider or random seed can run for dozens of generations on the small board before everything stabilizes or vanishes.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConwaySettings),
  reducer,
  isTerminal,
  component: GameOfLifeConwayGame,
};
