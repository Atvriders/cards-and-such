import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwapStackState, SwapStackAction, SwapStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SwapStackGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SwapStackGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const swapStackPlugin: GamePlugin<SwapStackState, SwapStackAction, typeof settings> = {
  id:"swap-stack", title:"Swap Stack", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each round, deal a card and choose to keep or swap. 10 rounds; higher cards score more.",
  howToPlay:`Swap Stack is a decision-driven card mini. Each round opens with a face-up card. You score points equal to that card's rank minus 1 — Aces are worth 13, Kings 12, all the way down to deuces worth just 1 — but you have a choice to make first.

You can KEEP the dealt card and bank its points, or SWAP it for a fresh draw. Once you swap, you're locked into the new card; you cannot swap a second time. There are 10 rounds total, and the deck is effectively infinite (each draw is independent).

Strategy: low cards are worth swapping. With expected value of ~7 from a fresh draw, anything below 8 (rank 9) statistically benefits from a swap. But variance is real — swap a 4 and you might pull a 2.

Press Keep or Swap to lock in your card; then Next to advance. Average scores hover around 60-75 points across 10 rounds.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SwapStackSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-swap-stack-primary"]', pulses: 3 }),component:SwapStackGame,
};
