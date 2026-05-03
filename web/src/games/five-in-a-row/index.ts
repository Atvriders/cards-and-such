import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FiveInARowGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FiveInARowGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fiveInARowPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "five-in-a-row",
  title: "Five in a Row",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Paper-and-pencil 5-in-a-row on a 7x7 grid. Place vs random CPU.",
  howToPlay: "Five in a Row is the simple paper-and-pencil ancestor of Gomoku and Renju, played here on a compact 7x7 grid. Two players alternate placing their marks on empty intersections (cells). The first player to align five marks in a horizontal, vertical, or diagonal line wins the game.\n\nClick any empty square to place your piece (P). A random CPU (C) responds by dropping a mark on a random empty cell. Continue placing until you complete a five-in-a-row pattern, or the board fills (a 49-cell board allows at most 24 moves each, so games rarely fill).\n\nScoring awards 100 points for victory, 25 for a draw, and 0 for a loss. Because the CPU plays purely random moves, you can usually engineer overlapping threats. Two open four-in-a-row lines force the CPU into an impossible defensive choice. Look for the classic double-three pattern that creates two disjoint four-threats simultaneously to seal the win quickly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".fir-board")) ? { selector: ".fir-board", pulses: 3 } : null,
  component: FiveInARowGame,
};
