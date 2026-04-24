import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ShobuState, ShobuAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShobuGame } from "./Game.js";

const settings = {} as const;

export const shobuPlugin: GamePlugin<ShobuState, ShobuAction, typeof settings> = {
  id: "shobu",
  title: "Shobu",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four-board abstract: passive move then aggressive push.",
  howToPlay: `Shobu is a modern abstract strategy game played on four 4×4 boards arranged in a 2×2 layout. Each player has 16 stones: 4 per board. You play dark stones on the bottom half (your home); the bot plays light stones on the top half.

Each turn consists of exactly two moves:

PASSIVE move (first): slide one of your stones on either of your two home boards (bottom row) any number of squares in a straight line (orthogonal or diagonal) into empty space. No capturing allowed here. This move sets the direction and distance for the aggressive move.

AGGRESSIVE move (second): on either of the two boards on the opponent's side (top row), move one of your stones in the exact same direction and same number of squares. This move CAN push exactly one opponent stone in that line — but you cannot push your own stones, and you cannot push if there are two opponent stones in a row ahead of you. A pushed stone that leaves the 4×4 board is removed permanently.

Win condition: clear all of an opponent's stones off any single board.

Strategy: choose passive moves that create useful aggressive directions. Diagonal moves are powerful for pushing into corners. Use the aggressive moves to gradually eliminate opponent pieces from one board.

Bot: minimax at depth 2. Use "Reset Turn" to undo your passive selection if you change your mind.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: ShobuGame,
};
