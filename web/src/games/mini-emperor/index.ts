import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniEmperorState, MiniEmperorAction, MiniEmperorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniEmperorGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniEmperorPlugin: GamePlugin<MiniEmperorState, MiniEmperorAction, typeof settings> = {
  id:"mini-emperor", title:"Mini Emperor", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Emperor solitaire mini.",
  howToPlay:"Mini Emperor is a tiny tribute to the classic Emperor solitaire (a relative of Forty Thieves and Napoleon at St. Helena). Twenty cards are dealt across the layout from a half-and-some deck. Tap any visible card to remove it from play, scoring 15 points per click.\n\nIn the original, you'd build foundations from Ace upward in suit and tableau columns down by suit — slow, strategic play. The mini drops the pile rules and lets you blast through a layout 20-card swath at high speed.\n\nYou have 28 clicks. Average scores land around 270 points. Clearing all 20 cards yields 300 — a clean Emperor finish. A great quick interlude between heavier solitaires for fans of forty thieves-style classics.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniEmperorSettings),
  reducer,isTerminal,component:MiniEmperorGame,
};
