import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AlquerqueState, AlquerqueAction, AlquerqueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Alquerque = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Alquerque as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const alquerquePlugin: GamePlugin<AlquerqueState, AlquerqueAction, typeof settings> = {
  id: "alquerque",
  title: "Alquerque",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient ancestor of Checkers — capture all 12 opponent pieces.",
  howToPlay: `Alquerque is one of the world's oldest strategy games, originating in the Middle East and later spreading to medieval Europe. It is the direct ancestor of modern Checkers. The game is played on a 5×5 grid of intersections connected by lines (orthogonally and diagonally at alternate points). You control White (12 pieces); the bot controls Black (12 pieces).

On each turn, you can move one piece to an adjacent empty intersection. If an opponent's piece is adjacent and the intersection beyond it is empty, you must capture — jump over the opponent's piece, removing it from the board. Captures are mandatory if available. Multiple consecutive captures in a single turn are also mandatory if possible.

Unlike Checkers, pieces can move and capture in ALL directions (including backward), and the board uses more varied connection patterns due to the diagonal-at-alternate-points rule.

To play: click one of your White pieces to select it (highlighted in yellow), then click a valid destination. Red highlights show captures (jumps); green highlights show regular moves. The bot uses minimax at depth 3.`,
  settings,
  initialState: (seed: number, s: AlquerqueSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".alquerque-board")) ? { selector: ".alquerque-board", pulses: 3 } : null,
  component: Alquerque,
};
