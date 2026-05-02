import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardShoeStoreState, CardShoeStoreAction, CardShoeStoreSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardShoeStoreGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardShoeStorePlugin: GamePlugin<CardShoeStoreState, CardShoeStoreAction, typeof settings> = {
  id:"card-shoe-store", title:"Card Shoe Store", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Collect matching pairs of shoes via same-rank draws.",
  howToPlay:"Card Shoe Store is a quick card-draw game with a same-rank pair bonus. 👟 Each draw flips one card from a fresh 52-card deck. The card's rank gives you points: numbers (2-10) score their face value, Jack is 11, Queen is 12, King is 13, and Ace is 14.\n\nIf your new card matches the rank of the previous card (a pair), you earn a bonus 10 points on top — pairs are rare and lucky finds. The deck reshuffles each draw, so each pair feels like a small win.\n\nYou play 12 draws total. Each draw shows the card and points; press Next to continue. There's no decision making — it's pure draw-and-tally fun. Average runs land near 100-130 points; the rare lucky run with multiple pairs pushes scores higher. The best part is the simple, clean themed atmosphere with each draw.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardShoeStoreSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-shoe-store-primary"]', pulses: 3 }), component:CardShoeStoreGame,
};
