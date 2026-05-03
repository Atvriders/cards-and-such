import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFishingState, CardFishingAction, CardFishingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardFishingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardFishingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFishingPlugin: GamePlugin<CardFishingState, CardFishingAction, typeof settings> = {
  id:"card-fishing", title:"Card Fishing", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cast for cards in 3 rank zones: Low (2-5), Mid (6-10), High (J-A). 12 catches.",
  howToPlay:"Card Fishing is a 12-round rank-bracket prediction game. Each cast, you choose where to fish for the next card: Low (ranks 2-5, 16 cards), Mid (ranks 6-10, 20 cards), or High (J, Q, K, A — 16 cards).\n\nIf the drawn card lands in your zone, you reel in 12 points. Mid is the largest pool (20/52 ≈ 38%), Low and High each hit ~31%. Across 12 casts an average run scores 35-55 points; a hot streak can crack 90.\n\nTap a zone to cast, watch the card surface, and see if you've hooked one. Press Next to advance.\n\nThere's no pattern memory — every draw is independent. The strategy is risk balance: Mid is steady, Low and High are slightly riskier but identical. Card Fishing is a calm, simple cast-and-reel mini ideal for relaxed play.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFishingSettings),
  reducer,isTerminal, hint: (state: CardFishingState): HintTarget | null => (state.phase === "predict" ? { selector: '[data-testid="hint-target-card-fishing-primary"]', pulses: 3 } : null),component:CardFishingGame,
};
