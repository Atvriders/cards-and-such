import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMeteorState, CardMeteorAction, CardMeteorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardMeteorGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMeteorPlugin: GamePlugin<CardMeteorState, CardMeteorAction, typeof settings> = {
  id:"card-meteor", title:"Card Meteor", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Meteor cards rain down. Pick the lowest to defuse them. 8 rounds.",
  howToPlay:"Card Meteor turns the deck into a falling sky. Each round, four meteor cards rain into view. To defuse them, pick the LOWEST-ranked card — it carries the smallest impact. The lower the rank you pick, the higher your score: a 2 scores 36 points, while an Ace (which counts as the highest rank here) scores zero.\n\nSpecifically, score is (12 minus rank index) × 3, where rank index goes 0=2, 1=3, ..., 12=Ace. So picking a 2 gives the maximum 36, a 3 gives 33, and so on.\n\nYou play 8 rounds. Maximum theoretical score is 288 (8 × 36), but realistically the lowest card you'll get dealt averages around rank-index-2-or-3, so expected scores land between 150-220. Top players who consistently identify the absolute lowest card can push 240+.\n\nLook for those low pips — and watch the sky!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMeteorSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-meteor-primary"]', pulses: 3 }), component:CardMeteorGame,
};
