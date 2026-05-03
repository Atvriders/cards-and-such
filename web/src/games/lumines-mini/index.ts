import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LuminesMiniState, LuminesMiniAction, LuminesMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LuminesMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LuminesMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const luminesMiniPlugin: GamePlugin<LuminesMiniState, LuminesMiniAction, typeof settings> = {
  id:"lumines-mini", title:"Lumines Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Block-sweeping match-3 with two-color pulse vibes.",
  howToPlay:"Lumines Mini is a sixty-second match-three sprint inspired by the classic Lumines block puzzler. The six-by-six grid is filled with vibrant rectangular blocks in just four colors, channeling the original's neon palette. Click two adjacent blocks to swap them; whenever the swap creates a horizontal or vertical run of three or more matching blocks, those blocks clear for ten points each. New blocks fall in from above and frequently trigger cascade chains for bonus points. Invalid swaps cancel without using a turn. With only four colors in play, matches form rapidly and cascade chains are abundant — average runs land near 350-450 points and cascade masters break 600 routinely. The clock counts down sixty seconds at the top. When the timer expires, your final score is locked in. Pulse along to your own rhythm and clear those blocks!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LuminesMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-lumines-mini-action"]', pulses: 3 }; }, component:LuminesMiniGame,
};
