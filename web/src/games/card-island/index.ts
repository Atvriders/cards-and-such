import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardIslandState, CardIslandAction, CardIslandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardIslandGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardIslandGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardIslandPlugin: GamePlugin<CardIslandState, CardIslandAction, typeof settings> = {
  id:"card-island", title:"Card Island", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Collect treasure on an island — face cards = treasure, 12 rounds.",
  howToPlay:"Card Island is a 12-round mini where face cards represent buried treasure on a desert island. Every Jack, Queen, and King in your 5-card hand counts as one piece of treasure, and you score 12 points for each treasure card found.\n\nEach round, press Deal 5 to discover the next sandy patch. The fewer face cards you draw, the leaner your treasure haul — but draws of 4 or 5 face cards are jackpots that can carry your score. With about 12/52 cards being faces, you'll average ~1.15 face per hand, so expect roughly 12-14 points per round on average.\n\nAfter 12 rounds your final treasure tally is set. A typical run lands near 130-180 points; lucky hauls can push you well above 250. Watch out — Aces don't count as treasure here, only the J, Q, K royals. Press Next between rounds to sail to the next island, or Finish on round 12.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardIslandSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-island-primary"]', pulses: 3 }), component:CardIslandGame,
};
