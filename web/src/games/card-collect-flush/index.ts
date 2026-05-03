import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCollectFlushState, CardCollectFlushAction, CardCollectFlushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardCollectFlushGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardCollectFlushGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCollectFlushPlugin: GamePlugin<CardCollectFlushState, CardCollectFlushAction, typeof settings> = {
  id:"card-collect-flush", title:"Card Collect Flush", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal 5 cards each round and hope for a flush. 8 rounds.",
  howToPlay:`Card Collect Flush is a luck-driven flush hunter spread across 8 rounds. Each round you press Deal 5 to flip 5 random cards from a fresh shuffle. The game then counts cards of the same suit and scores by the best suit count:

— 5 of one suit (a true flush): 100 points
— 4 of one suit: 50 points
— 3 of one suit: 20 points
— 2 or fewer: 0 points

There are no choices, no holds, no draws — pure shuffle and reveal. The chance of a true flush from a fresh deal is roughly 1 in 500, so don't expect many. Most rounds will land at 3-of-suit (20 points) or 2-of-suit (zero), making averages around 12 points per round.

Across 8 rounds you can expect roughly 80-130 points; a flush in any round catapults you to 200+. The all-time peak run with two flushes can reach 400+ — pure luck, but pure thrill.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCollectFlushSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-collect-flush-primary"]', pulses: 3 }), component:CardCollectFlushGame,
};
