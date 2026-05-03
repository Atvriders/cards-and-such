import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedPairPickupState, RedPairPickupAction, RedPairPickupSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RedPairPickupGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RedPairPickupGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const redPairPickupPlugin: GamePlugin<RedPairPickupState, RedPairPickupAction, typeof settings> = {
  id:"red-pair-pickup", title:"Red Pair Pickup", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick up red card pairs over 14 rounds.",
  howToPlay:"Red Pair Pickup is a fast hand-of-two card mini. Each round you're dealt 2 random cards from a standard 52-card deck. If both cards are red (Hearts or Diamonds), you score 30 points; otherwise 0. There are 14 rounds total — short, snappy, and pure RNG enjoyment.\n\nThe probability of being dealt two red cards is roughly 24.5% (26/52 × 25/51). Across 14 rounds the expected value is about 100 points; lucky streaks can push you to 200+ for top scores. Press Deal to roll the cards, then Next to advance to the next round.\n\nA perfect game (every round red-red) yields 420 points but is fantastically rare. Average runs land near 90-110 points. Quick, rhythmic, and surprisingly addictive between heavier card games.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RedPairPickupSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-red-pair-pickup-primary"]', pulses: 3 }),component:RedPairPickupGame,
};
