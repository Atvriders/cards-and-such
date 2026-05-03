import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeroRealmsQuestState, HeroRealmsQuestAction, HeroRealmsQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HeroRealmsQuestGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HeroRealmsQuestGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const heroRealmsQuestPlugin: GamePlugin<HeroRealmsQuestState, HeroRealmsQuestAction, typeof settings> = {
  id:"hero-realms-quest",
  title:"Hero Realms Quest",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Recruit a band of heroes deck-building style.",
  howToPlay:"Hero Realms Quest is a 10-turn solo deckbuild. You start with 7 Squires (1 coin each) and 3 Rangers (1 VP each). Each turn draws 5 cards from your shuffled deck. Play All converts hand to coin, then you may buy one card from the shop and End Turn.\n\nShop: Soldier (3c, +2c), Knight (6c, +3c), Ranger (2c, +1VP), Captain (5c, +3VP), Hero (8c, +6VP). Bought cards enter discard and shuffle into future hands.\n\nWhen the dust settles after 10 turns, every VP-bearing card in your final deck counts. Each victory point is worth 5 score points. Hero scores typically land in the 70-150 range — invest in Knights early, then Captains and Heroes at the end.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HeroRealmsQuestSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "play") return { selector: '[data-testid="hint-target-hero-realms-quest-primary"]', pulses: 3 };
      if (state.phase === "buy") return { selector: '[data-testid="hint-target-hero-realms-quest-next"]', pulses: 3 };
      return null;
    },
  component:HeroRealmsQuestGame,
};
