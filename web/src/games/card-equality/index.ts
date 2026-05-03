import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardEqualityState, CardEqualityAction, CardEqualitySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardEqualityGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardEqualityGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardEqualityPlugin: GamePlugin<CardEqualityState, CardEqualityAction, typeof settings> = {
  id:"card-equality", title:"Card Equality", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score when all 5 dealt cards share the same rank.",
  howToPlay:"Card Equality is a high-variance card mini. Each round you're dealt 5 random cards from a 52-card deck. If all 5 have the same rank (e.g. five Jacks across all four suits + a duplicate — impossible, since only 4 of each rank exist!), you score 200 points. Otherwise 0.\n\nIn a single 52-card deck, getting 5 cards of the same rank is impossible (max is 4-of-a-kind), so this game's probability is effectively 0. The mini's deal samples with replacement-style RNG so duplicate ranks DO happen. There are 8 rounds total.\n\nPress Deal to flip the 5 cards, then Next to advance. With astronomical odds against, average scores are near 0; even hitting once gives you a top score. A quirky, tongue-in-cheek minigame to play between quick rounds. Jackpot or bust!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardEqualitySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-equality-primary"]', pulses: 3 }), component:CardEqualityGame,
};
