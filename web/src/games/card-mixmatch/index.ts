import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMixmatchState, CardMixmatchAction, CardMixmatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardMixmatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardMixmatchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMixmatchPlugin: GamePlugin<CardMixmatchState, CardMixmatchAction, typeof settings> = {
  id:"card-mixmatch", title:"Card Mixmatch", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score when 5 cards split nearly half red/half black.",
  howToPlay:"Card Mixmatch deals you 5 random cards each round. If the hand splits nearly half red and half black (specifically the difference between red and black counts is at most 1, so 2-3 or 3-2), you score 30 points. Otherwise 0. There are 8 rounds total.\n\nThe probability of a 5-card mix being 2-3 or 3-2 by color is roughly 62.5% — so this is one of the friendlier minigames in the catalog. Expected value across 8 rounds is around 150 points; consistent runs of 200+ are common.\n\nPress Deal to flip the 5 cards, then Next to advance. The hand is shown as dealt with red cards highlighted. Your job is just to root for the balance. A cheerful, frequent-payout filler perfect for a quick rhythm fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMixmatchSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-mixmatch-primary"]', pulses: 3 }), component:CardMixmatchGame,
};
