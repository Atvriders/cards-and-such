import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MisereTicTacToeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MisereTicTacToeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const misereTicTacToePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "misere-tic-tac-toe",
  title: "Misere Tic-Tac-Toe",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Anti-TTT: getting 3-in-a-row LOSES. Place vs random CPU.",
  howToPlay: "Misere Tic-Tac-Toe inverts the classical objective: instead of trying to form three of your marks in a row, you must avoid forming any three-in-a-row. The first player to align three of their own pieces horizontally, vertically, or diagonally LOSES the game. This twist transforms the timeless game into a battle of avoidance and forced moves.\n\nGameplay alternates between you (P) and a random CPU (C) on a standard 3x3 grid. Click any empty square to place your mark. The CPU then drops its piece on a random empty cell. Continue until either side accidentally completes three-in-a-row, or the board fills.\n\nYou earn 100 points for forcing the CPU into a losing line, 25 for a board-full draw, and 0 if you slip up first. Because the CPU plays randomly, you should focus on never being forced into placing a third mark on a winning line. Sometimes you must sacrifice tempo to avoid completing a row. Quick, devious, and surprisingly tense.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".misttt-board")) ? { selector: ".misttt-board", pulses: 3 } : null,
  component: MisereTicTacToeGame,
};
