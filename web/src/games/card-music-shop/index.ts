import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMusicShopState, CardMusicShopAction, CardMusicShopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardMusicShopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardMusicShopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMusicShopPlugin: GamePlugin<CardMusicShopState, CardMusicShopAction, typeof settings> = {
  id:"card-music-shop", title:"Card Music Shop", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each rank is a note; same suit scores bonus harmony.",
  howToPlay:"Card Music Shop is a quick card-draw game with a same-suit bonus. 🎵 Each draw flips one card from a fresh 52-card deck. The card's rank gives you points: numbers (2-10) score their face value, Jack is 11, Queen is 12, King is 13, and Ace is 14.\n\nIf your new card matches the suit of the previous card, you score a bonus 5 points on top — chains of same-suit draws can rack up extra fast. The deck reshuffles each draw, so suits aren't depleting; you're just betting the seeded RNG sends you matching cards.\n\nYou play 12 draws total. Each draw shows the card and points; press Next to continue. There's no decision making — it's pure draw-and-tally fun. Average runs land near 100-130 points; lucky players riding suit streaks push 160+. The best part is the simple, clean shop-themed atmosphere with each draw.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMusicShopSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-music-shop-primary"]', pulses: 3 }), component:CardMusicShopGame,
};
