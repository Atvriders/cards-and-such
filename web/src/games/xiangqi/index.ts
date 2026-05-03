import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { XqState, XqAction, XqSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Xiangqi = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Xiangqi as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const xiangqiPlugin: GamePlugin<XqState, XqAction, typeof settings> = {
  id: "xiangqi",
  title: "Xiangqi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese Chess — capture the enemy General with seven piece types including the leaping Cannon.",
  howToPlay: `Xiangqi (Chinese Chess) is played on a 9×10 board divided by a river in the middle. You play Red; the bot plays Black. Capture the enemy General to win — or leave the General with no legal moves (checkmate).

Pieces and movement: the General moves one step orthogonally within the 3×3 palace and may never face the opposing General directly with no pieces between (the "flying general" rule). Advisors move one step diagonally within the palace. Elephants move exactly two steps diagonally but cannot cross the river and are blocked if the midpoint is occupied. Horses move one step orthogonally then one diagonally, blocked if the first step is occupied. Chariots slide any number of squares orthogonally. Cannons move like Chariots but can only capture by jumping over exactly one piece (the "screen"). Soldiers move forward one step; after crossing the river they may also move sideways.

The game ends when a General has no legal moves. Click a Red piece to select it; highlighted squares show legal destinations. Click a highlighted square to move. The bot plays Black at depth 2.`,
  settings,
  initialState: (seed: number, s: XqSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".xiangqi-svg")) ? { selector: ".xiangqi-svg", pulses: 3 } : null,
  component: Xiangqi,
};
