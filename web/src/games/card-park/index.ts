import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardParkState, CardParkAction, CardParkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardParkGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardParkGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardParkPlugin: GamePlugin<CardParkState, CardParkAction, typeof settings> = {
  id:"card-park", title:"Card Park", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stroll through the park — Diamonds (sunshine) score!",
  howToPlay:`Card Park is a relaxing card draw game with a park stroll theme. Over 12 cards from a shuffled deck, only Diamonds (the bright sunshine of the park) score points. Each Diamond is worth 10 points. Spades, Hearts, and Clubs score zero.

Press Draw Card to reveal each card. The score updates with each draw. After 12 cards, your park walk ends. With 13 Diamonds in a 52-card deck, you should expect about 3 Diamonds per game (12 × 13/52 = 3) — that's around 30 points on average. Sunny luck can yield 50-80 points; cloudy days might leave you with fewer than 20.

There are no choices to make. Just enjoy the stroll, draw your cards, and hope the diamonds shine through. Watch out — you might find yourself wishing for a sunnier deck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardParkSettings),
  reducer,isTerminal, hint: (state: CardParkState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-card-park-primary"]', pulses: 3 } : null),component:CardParkGame,
};
