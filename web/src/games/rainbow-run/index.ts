import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RainbowRunState, RainbowRunAction, RainbowRunSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RainbowRunGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RainbowRunGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rainbowRunPlugin: GamePlugin<RainbowRunState, RainbowRunAction, typeof settings> = {
  id:"rainbow-run", title:"Rainbow Run", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw cards and collect all four suits as fast as possible. 12 draws total; +10 per full rainbow.",
  howToPlay:`Rainbow Run is a four-suit collection mini. You'll draw 12 cards total, one at a time. As each card flips, its suit is added to a tracker showing the four suit symbols (spades, hearts, diamonds, clubs). The moment your tracker contains all four suits, you score 10 points and the tracker resets — then you start collecting again from scratch.

Each draw is independent (the deck is effectively infinite), so suit-distribution is random across all 12 draws. The minimum number of draws to complete a rainbow is 4 (one of each suit), but the average is closer to ~8 due to the well-known coupon-collector problem.

In a 12-card run, expect 1-2 rainbows on most games — that's 10-20 points. A super-lucky run might land 3 rainbows for 30 points. Press Draw to flip a card; the tracker updates immediately, and any completed rainbow lights up before resetting.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RainbowRunSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-rainbow-run-primary"]', pulses: 3 }),component:RainbowRunGame,
};
