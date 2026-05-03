import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TwelveMensMorrisGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TwelveMensMorrisGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const twelveMensMorrisPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "twelve-mens-morris",
  title: "Twelve Men's Morris",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Larger Morris with diagonals — form mills (3-in-a-row) to remove CPU. Place vs random CPU.",
  howToPlay: "Twelve Men's Morris is the largest classical Morris variant, played on a board with 24 line intersections augmented with diagonal connections. Both players have 12 pieces to place, and forming a mill (3-in-a-row along any line) lets you remove an opposing piece. In this compact 5x5 grid adaptation, the mill-line concept is preserved with rows, columns, and both diagonals.\n\nClick any empty cell to place a P piece. If your placement completes any 3-in-a-row line (horizontal, vertical, or diagonal), one randomly-chosen C piece is removed from the board. After your turn, a random CPU drops a C piece that may symmetrically remove a P piece by forming a mill.\n\nGameplay lasts up to 18 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 4 points per surviving P piece. The 5x5 grid offers many possible mill lines — try to engineer placements that simultaneously create two threatening mill possibilities, forcing the CPU into a bad position regardless of where its random move lands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".tmm-board")) ? { selector: ".tmm-board", pulses: 3 } : null,
  component: TwelveMensMorrisGame,
};
