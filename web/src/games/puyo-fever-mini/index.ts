import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PuyoFeverMiniState, PuyoFeverMiniAction, PuyoFeverMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PuyoFeverMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PuyoFeverMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const puyoFeverMiniPlugin: GamePlugin<PuyoFeverMiniState, PuyoFeverMiniAction, typeof settings> = {
  id:"puyo-fever-mini", title:"Puyo Fever Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fever-mode blob match-3 sprint.",
  howToPlay:"Puyo Fever Mini is a 60-second match-3 sprint inspired by classic gem-swap puzzlers. The board is a six-by-six grid filled with colorful tiles drawn from a set of six themed icons unique to this variant. Click any tile to select it, then click an adjacent tile (up, down, left, or right) to attempt a swap. If the swap creates a row or column of three or more identical tiles, the matched group vanishes and you score ten points per cleared tile. New tiles cascade down from above to refill the empty cells, sometimes triggering chain reactions for bonus clears that stack scores quickly. Invalid swaps that produce no match are simply cancelled, leaving your selection cleared so you can try another pair. The clock counts down in the header and is your only enemy. Plan two or three moves ahead, watch for L-shaped opportunities, and chase those big multi-cascade combos. When the timer hits zero, your final score is locked. Sharper play yields higher totals — match fast, match smart, match often. Themed: Fever-mode blob match-3 sprint.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PuyoFeverMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-puyo-fever-mini-action"]', pulses: 3 }; }, component:PuyoFeverMiniGame,
};
