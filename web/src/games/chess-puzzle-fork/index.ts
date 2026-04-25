import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const chessPuzzleForkPlugin = {
  id: "chess-puzzle-fork",
  title: "Chess Fork Puzzles",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Six puzzles focused on the fork tactic — attack two pieces at once and win material!",
  howToPlay: `Chess Fork Puzzles focuses on one of the most exciting tactical weapons in chess: the Fork. A fork is a single move that attacks two or more enemy pieces simultaneously, forcing your opponent to lose material because they can only save one.

The knight is the master forker — its unusual L-shaped movement lets it attack pieces that cannot attack back along the same line. But queens, bishops, rooks, and even pawns can fork too.

Each puzzle presents a position where you can play a fork to win material. Click a white piece to select it and see legal destination squares highlighted. Click a highlighted square to make the move. If you find the correct forking move you advance to the next puzzle and earn 100 points.

A perfect score is 600 (all six solved first try). If you play a wrong move press Try Again to reset the position and give it another go. Study the positions: look for enemy pieces that are close together and ask which of your pieces could land between them in a single move!`,
  settings: {} as Record<string, never>,
  initialState: () => initialState(),
  reducer,
  isTerminal,
  component: Game,
} as unknown as GamePlugin;
