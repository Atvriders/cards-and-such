import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClickomaniaMiniState, ClickomaniaMiniAction, ClickomaniaMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ClickomaniaMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ClickomaniaMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const clickomaniaMiniPlugin: GamePlugin<ClickomaniaMiniState, ClickomaniaMiniAction, typeof settings> = {
  id:"clickomania-mini", title:"Clickomania Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Swap-and-clear browser SameGame variant.",
  howToPlay:"Clickomania Mini is a sixty-second match-three inspired by the browser-classic Clickomania block-clicker. The six-by-six grid is filled with colored squares in just four bold colors. Click two adjacent squares to swap them; whenever the swap creates a horizontal or vertical run of three or more matching colors, those squares clear for ten points each, and new squares fall in from above. Cascade chains happen often with so few colors in play, and they pay big bonus points. Invalid swaps cancel without using a turn. With the smallest color palette of any of our match-threes, Clickomania Mini is the highest-scoring of the bunch — average runs land near 380-480 points, and four-color cascade chains routinely break 600. The clock counts down sixty seconds at the top of the screen. When the timer hits zero, your final score is locked in. Click, swap, cascade — repeat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClickomaniaMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-clickomania-mini-action"]', pulses: 3 }; }, component:ClickomaniaMiniGame,
};
