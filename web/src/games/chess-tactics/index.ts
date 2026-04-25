import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const chessTacticsPlugin = {
  id: "chess-tactics",
  title: "Chess Tactics",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 tactical puzzles covering forks, pins, skewers, and discovered attacks.",
  howToPlay: `Chess Tactics introduces four fundamental tactical weapons: the Fork, Pin, Skewer, and Discovered Attack. Mastering these patterns is essential for winning games.

A Fork attacks two or more enemy pieces simultaneously, forcing the opponent to sacrifice one. Knights are famous forkers because of their unique L-shaped movement.

A Pin immobilizes an enemy piece because moving it would expose a more valuable piece (often the king) to capture. Absolute pins are against the king and cannot be broken legally.

A Skewer is like a reverse pin: you attack a high-value piece, which must move, exposing a lesser piece behind it to capture.

A Discovered Attack occurs when you move one piece, revealing an attack by a piece behind it. If that attack is check, it is a Discovered Check — one of the most powerful moves in chess.

Each puzzle labels its theme. Click a white piece to select it, then click a highlighted square to execute the tactic. If wrong, retry the position. Progress through all 12 puzzles to master chess tactics!`,
  settings: {} as const,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  component: Game,
} as unknown as GamePlugin;
