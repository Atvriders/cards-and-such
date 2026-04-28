import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EightPuzzleState, EightPuzzleAction, EightPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EightPuzzleGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const eightPuzzlePlugin: GamePlugin<EightPuzzleState, EightPuzzleAction, typeof settings> = {
  id: "eight-puzzle",
  title: "Eight Puzzle Logic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `3×3 sliding-tile puzzle: pick the next optimal tile to slide.`,
  howToPlay: `The Eight Puzzle is the 3×3 cousin of the Fifteen Puzzle — eight numbered tiles plus one empty cell. It's the canonical AI search problem and a great pencil-and-paper logic exercise.

In this solo puzzle adaptation, each puzzle shows a partially-scrambled 3×3 board and asks which tile slides next on the optimal solution path. Pick from candidate tiles.

Eight puzzles per session, 100 points each (800 max).

Tips: solve top-row-then-left-column first. The "last two of a row" setup involves rotating three tiles using the empty cell. Optimal Eight-Puzzle solutions average around 22 moves from a fully-shuffled start; the worst case is 31 moves. Recognise patterns: when the empty is adjacent to a tile that wants to move toward its goal, that's almost always the right move.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EightPuzzleSettings),
  reducer,
  isTerminal,
  component: EightPuzzleGame,
};
