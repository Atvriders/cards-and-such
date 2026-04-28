import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMirageState, CardMirageAction, CardMirageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardMirageGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMiragePlugin: GamePlugin<CardMirageState, CardMirageAction, typeof settings> = {
  id:"card-mirage", title:"Card Mirage", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mirage cards (low-rank fakes) hide among reals. Pick reals. 8 rounds.",
  howToPlay:"Card Mirage tests your ability to tell real cards from desert illusions. Each round, five cards appear in the heat shimmer. Cards with rank 2, 3, or 4 are mirages — pick one and you score zero. Anything 5 or higher is real, and scores (rank value × 2): so a 5 = 14, a 10 = 24, Jack = 26, Ace = 28.\n\nThe strategy: scan the cards, eliminate the low-rank mirages (2/3/4), and pick the highest real card available. Roughly 3/13 of cards are mirages, so you'll usually have several real options.\n\nYou play 8 rounds. If you always pick the highest real card from each hand, expected scores land around 160-200. Top players who consistently spot Aces and Kings can push 220+. Maximum theoretical: 224 (8 × 28).\n\nKeep your wits about you — the desert plays tricks, but the real cards reward sharp eyes.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMirageSettings),
  reducer,isTerminal,component:CardMirageGame,
};
