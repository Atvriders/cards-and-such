import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTreasureHuntState, CardTreasureHuntAction, CardTreasureHuntSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardTreasureHuntGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardTreasureHuntGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTreasureHuntPlugin: GamePlugin<CardTreasureHuntState, CardTreasureHuntAction, typeof settings> = {
  id:"card-treasure-hunt", title:"Card Treasure Hunt", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hunt for ace treasures. 14 draws. 50 points per ace.",
  howToPlay:"Card Treasure Hunt is a 14-draw mini. You're hunting for buried treasure — represented by Aces — across a sandy beach. Each round, you draw one card. Aces are the treasure (any of the 4 in the deck) and score 50 points; all other cards score 0.\n\nThe probability of an Ace per draw is 4/52, or roughly 7.7%. Across 14 rounds, the expected number of aces is about 1.08, so most games will yield 1 or 2 aces (50-100 points). Lucky players can occasionally land 3 or even 4 aces (200 points!).\n\nThere's no skill, no choice — just press Draw, see if you've struck gold, and continue. It's a fun reset of probability: most rounds you'll get nothing, but when an Ace pops up, it's worth a lot. The big-payoff rare-event structure makes it more exciting than a 50/50.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTreasureHuntSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-treasure-hunt-primary"]', pulses: 3 }),component:CardTreasureHuntGame,
};
