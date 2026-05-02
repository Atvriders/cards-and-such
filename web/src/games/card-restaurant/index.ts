import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardRestaurantState, CardRestaurantAction, CardRestaurantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardRestaurantGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardRestaurantPlugin: GamePlugin<CardRestaurantState, CardRestaurantAction, typeof settings> = {
  id:"card-restaurant", title:"Card Restaurant", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Restaurant mini — assemble pairs and triples on the menu.",
  howToPlay:"Card Restaurant is a tiny bistro card mini. Twelve cards arrive two at a time. Each round you decide Take (serve to the dining room) or Skip (send back to the kitchen). Your goal is to assemble pairs of identical ranks — combos always score better in a kitchen.\n\nFinal scoring: 5 points per card kept, +30 for every pair of same ranks in your kept set, +60 for any three-of-a-kind. Loose cards still score, but combos are where the chef earns their stars.\n\nSix rounds total (12 cards). The strategy is stewardly: take cards that complement what you've already picked up, and skip lonely ones with no combo potential. Pull off two pairs and a triplet and you'll be the toast of the trivia town!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardRestaurantSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-restaurant-primary"]', pulses: 3 }), component:CardRestaurantGame,
};
