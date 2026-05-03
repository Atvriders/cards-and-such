import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { JanggiState, JanggiAction, JanggiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Janggi = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Janggi as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const janggiPlugin: GamePlugin<JanggiState, JanggiAction, typeof settings> = {
  id: "janggi",
  title: "Janggi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean Chess — artillery warfare on a 9×10 board with cannons that must leap to capture.",
  howToPlay: `Janggi is the traditional chess of Korea, played on a 9×10 board. You play Blue (bottom); the bot plays Red (top). Checkmate or trap the enemy General to win.

Pieces and movement: General (將/帥) moves one step orthogonally or diagonally within the 3×3 palace. Advisor (士) moves the same way as the General. Elephant (象) moves one step orthogonally then two steps diagonally, and is blocked if any intermediate square is occupied. Horse (馬) moves one step orthogonally then one step diagonally, blocked if the first step is occupied. Chariot (車) slides any number of squares orthogonally, and can also move along palace diagonal lines. Cannon (砲) must jump over exactly one non-Cannon piece to move or capture, and can never jump or capture another Cannon. Soldier (卒/兵) moves one step forward or one step sideways.

A key difference from Chinese Chess: Janggi Soldiers can move sideways from the very start (not just after crossing the river). The Elephant follows a longer path (1+2 diagonal) compared to Xiangqi.

Click a piece to select it; highlighted squares show legal moves. The bot plays Red at depth 2.`,
  settings,
  initialState: (seed: number, s: JanggiSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".janggi-svg")) ? { selector: ".janggi-svg", pulses: 3 } : null,
  component: Janggi,
};
