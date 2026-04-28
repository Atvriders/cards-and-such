import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceShrineState, DiceShrineAction, DiceShrineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceShrineGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceShrinePlugin: GamePlugin<DiceShrineState, DiceShrineAction, typeof settings> = {
  id:"dice-shrine", title:"Dice Shrine", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Visit a shrine; each action gives bonus dice rewards. 8 rounds.",
  howToPlay:"Dice Shrine is a mystical 8-round dice ritual where you choose how to honor the shrine each turn: Bow (safe, +d6), Pray (+d8 with bonus chance), or Offer (+d12 high risk).\n\nAfter your choice, dice are rolled and you collect points based on the outcome. Bow always grants 1 die roll (1-6 = points). Pray rolls a die 1-8 and adds a +5 shrine blessing. Offer rolls a die 1-12; rolling 12 grants the dramatic 30-point shrine vision, otherwise you keep what's rolled.\n\nTap your choice to perform the ritual. Watch the dice fall and see your shrine reward. Press Next to advance to the next altar.\n\nA typical 8-round pilgrimage scores 40-80 points; a daring Offer-heavy run can soar past 100, while a steady Bow path stays in the safe 30-50 range. Dice Shrine rewards both careful and bold pilgrims.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceShrineSettings),
  reducer,isTerminal,component:DiceShrineGame,
};
