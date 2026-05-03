import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HighFiveCardsState, HighFiveCardsAction, HighFiveCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HighFiveCardsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HighFiveCardsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const highFiveCardsPlugin: GamePlugin<HighFiveCardsState, HighFiveCardsAction, typeof settings> = {
  id:"high-five-cards", title:"High Five Cards", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Five-card high-sum game — higher totals score more across 8 rounds.",
  howToPlay:`High Five Cards is the mirror of Low Five — here, big totals are rewarded. Each round, five cards are dealt face-up. Sum their pip values: 2 through 10 face value, Jack 11, Queen 12, King 13, and Ace counts as a high 14.

Higher sums score more points. Sum 50 or above nets 50 points. 45-49 nets 30. 40-44 nets 15. 35-39 nets 5. Anything 34 or lower scores zero.

The expected average sum of five random cards (Ace high) is around 40, so most rounds will land somewhere in the middle of the scoring tiers — making this game just slightly more rewarding than Low Five on average.

You play 8 rounds, all decided by chance. Watch for those Aces (14 each!), Kings, and Queens stacking up — when fortune deals you a face-card-heavy hand, you'll feel like a high roller. Average expected scores hover around 50-80 points across the full game.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HighFiveCardsSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-high-five-cards-primary"]', pulses: 3 }),component:HighFiveCardsGame,
};
