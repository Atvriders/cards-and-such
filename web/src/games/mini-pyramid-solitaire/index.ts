import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniPyramidSolitaireState, MiniPyramidSolitaireAction, MiniPyramidSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniPyramidSolitaireGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniPyramidSolitairePlugin: GamePlugin<MiniPyramidSolitaireState, MiniPyramidSolitaireAction, typeof settings> = {
  id:"mini-pyramid-solitaire", title:"Mini Pyramid Solitaire", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 7-card pyramid pair-removal solitaire mini.",
  howToPlay:"Mini Pyramid Solitaire is a compact pair-removal solitaire built on a 28-card subset. A pyramid of 21 cards is dealt face-up. Tap any card in the pyramid to remove it, scoring 15 points per card cleared. The classical pyramid rule pairs cards to a sum of 13, but in this mini you simply tap cards to lift them off the pyramid one at a time, simulating the satisfying tear-down of the structure.\n\nYou have 30 clicks to remove as many cards as possible. The faster you clear, the higher your final score. Try to plan ahead: cards near the bottom of the pyramid are easiest to grab, while the apex is reached only after layers below are cleared.\n\nAverage runs land around 200-300 points; clearing the entire pyramid maxes out at 315 points if you're efficient. A relaxed game of pace and pattern.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniPyramidSolitaireSettings),
  reducer,isTerminal,component:MiniPyramidSolitaireGame,
};
