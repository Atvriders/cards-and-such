import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCandyShopState, CardCandyShopAction, CardCandyShopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardCandyShopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardCandyShopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCandyShopPlugin: GamePlugin<CardCandyShopState, CardCandyShopAction, typeof settings> = {
  id:"card-candy-shop", title:"Card Candy Shop", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sweet rank scoring with surprise pair bonuses.",
  howToPlay:"Card Candy Shop is a quick card-draw game with a same-rank pair bonus. 🍬 Each draw flips one card from a fresh 52-card deck. The card's rank gives you points: numbers (2-10) score their face value, Jack is 11, Queen is 12, King is 13, and Ace is 14.\n\nIf your new card matches the rank of the previous card (a pair), you earn a bonus 10 points on top — pairs are rare and lucky finds. The deck reshuffles each draw, so each pair feels like a small win.\n\nYou play 12 draws total. Each draw shows the card and points; press Next to continue. There's no decision making — it's pure draw-and-tally fun. Average runs land near 100-130 points; the rare lucky run with multiple pairs pushes scores higher. The best part is the simple, clean themed atmosphere with each draw.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCandyShopSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-candy-shop-primary"]', pulses: 3 }), component:CardCandyShopGame,
};
