import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardToyStoreState, CardToyStoreAction, CardToyStoreSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardToyStoreGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardToyStorePlugin: GamePlugin<CardToyStoreState, CardToyStoreAction, typeof settings> = {
  id:"card-toy-store", title:"Card Toy Store", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Toy store cards. Face cards score bonus toys.",
  howToPlay:"Card Toy Store is a quick card-draw game where face cards (J, Q, K) earn extra rewards. 🧸 Each draw flips one card from a fresh 52-card deck and you earn the rank value: numbers (2-10) score their face value, Jack is 11, Queen is 12, King is 13, and Ace is 14.\n\nWhen you draw a face card (Jack, Queen, or King), you also get a bonus 10 points — collecting these special cards is the path to higher scores. The deck reshuffles each draw, so face-card chances stay constant.\n\nYou play 12 draws total. Each draw shows the card and resulting points; press Next to continue. There's no decision making — it's pure draw-and-tally fun. Average runs land near 110-140 points; players hitting multiple face cards can push past 180. The best part is the simple, clean themed atmosphere with each card draw.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardToyStoreSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-toy-store-primary"]', pulses: 3 }),component:CardToyStoreGame,
};
