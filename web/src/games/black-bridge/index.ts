import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackBridgeState, BlackBridgeAction, BlackBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackBridgeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blackBridgePlugin: GamePlugin<BlackBridgeState, BlackBridgeAction, typeof settings> = {
  id:"black-bridge", title:"Black Bridge", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score by drawing consecutive black cards; resets on red. 12 draws.",
  howToPlay:`Black Bridge is the dark twin of Red River. You'll draw 12 cards. Every black card (clubs or spades) lengthens your streak; the points scored on each black draw equal 10 times your new streak length. A red card resets your streak to zero — but your earlier points stay locked in.

A solo black is +10. Two blacks in a row: +10 then +20 = +30 total. Five blacks in a row scores 10+20+30+40+50 = +150 from those five draws. So whenever the bridge is holding, every step over it pays more than the last.

Average runs land around 80–120 points. A six-card black streak is the stuff of legend, worth 210 points by itself! Press Draw to flip a card, then Next. Pure luck, but pure thrill — march across the bridge as far as the deck will let you!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BlackBridgeSettings),
  reducer,isTerminal,component:BlackBridgeGame,
};
