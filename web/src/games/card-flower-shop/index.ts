import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFlowerShopState, CardFlowerShopAction, CardFlowerShopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFlowerShopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFlowerShopPlugin: GamePlugin<CardFlowerShopState, CardFlowerShopAction, typeof settings> = {
  id:"card-flower-shop", title:"Card Flower Shop", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Flower shop mini — balance reds and blacks in a bouquet.",
  howToPlay:"Card Flower Shop is a tiny bouquet-building mini. Twelve cards arrive two at a time. Each round you decide Take (add to bouquet) or Skip (back on the rack). Build a beautiful arrangement that mixes red and black cards — every great florist balances the palette.\n\nFinal scoring: 5 points per kept card, +5 for every red card kept, +5 for every black card kept, and +40 if your bouquet has at least 3 reds and at least 3 blacks (a balanced spray).\n\nSix rounds total (12 cards). Take liberally and aim for balance — too many of one color and you lose the harmony bonus. The best florists can spot a wilted bloom and skip it without hesitation.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFlowerShopSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-flower-shop-primary"]', pulses: 3 }), component:CardFlowerShopGame,
};
