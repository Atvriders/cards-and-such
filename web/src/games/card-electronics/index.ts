import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardElectronicsState, CardElectronicsAction, CardElectronicsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardElectronicsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardElectronicsPlugin: GamePlugin<CardElectronicsState, CardElectronicsAction, typeof settings> = {
  id:"card-electronics", title:"Card Electronics", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tech rank scoring. Pairs of cards make a circuit bonus.",
  howToPlay:"Card Electronics is a quick card-draw game with a same-rank pair bonus. 💻 Each draw flips one card from a fresh 52-card deck. The card's rank gives you points: numbers (2-10) score their face value, Jack is 11, Queen is 12, King is 13, and Ace is 14.\n\nIf your new card matches the rank of the previous card (a pair), you earn a bonus 10 points on top — pairs are rare and lucky finds. The deck reshuffles each draw, so each pair feels like a small win.\n\nYou play 12 draws total. Each draw shows the card and points; press Next to continue. There's no decision making — it's pure draw-and-tally fun. Average runs land near 100-130 points; the rare lucky run with multiple pairs pushes scores higher. The best part is the simple, clean themed atmosphere with each draw.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardElectronicsSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-electronics-primary"]', pulses: 3 }), component:CardElectronicsGame,
};
