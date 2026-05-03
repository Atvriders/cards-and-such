import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BargainQuestShopState, BargainQuestShopAction, BargainQuestShopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BargainQuestShopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BargainQuestShopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bargainQuestShopPlugin: GamePlugin<BargainQuestShopState, BargainQuestShopAction, typeof settings> = {
  id:"bargain-quest-shop",
  title:"Bargain Quest Shop",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stock fantasy items to sell to heroes.",
  howToPlay:"Bargain Quest Shop is a 10-round shop-keeping card game. Each round, you draft three Item cards from your fantasy shop deck: Potion (3), Sword (4), Armor (5), Staff (6), and Legendary Relic (9). Your round score is the sum of items drafted. 🛒\n\nSimple stocking, simple profit. Across 10 rounds expect totals near 130 to 180. A round of three Legendary Relics scores 27 — a once-in-a-lifetime sale.\n\nPress Draw to draft your three items, then Next to open shop tomorrow. Each item is named and priced clearly. Score 160+ to become the most prosperous shopkeeper in the village. Bargain Quest is a beloved fantasy shop-keeping board game; this miniature captures the joy of a well-stocked storefront in a quick, breezy run finishing in under a minute. Charming and approachable for any fantasy fan.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BargainQuestShopSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-bargain-quest-shop-primary"]', pulses: 3 }),
  component:BargainQuestShopGame,
};
