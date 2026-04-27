import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBakerDozenState, MiniBakerDozenAction, MiniBakerDozenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniBakerDozenGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniBakerDozenPlugin: GamePlugin<MiniBakerDozenState, MiniBakerDozenAction, typeof settings> = {
  id:"mini-baker-dozen", title:"Mini Bakers Dozen", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"13 piles of 4 cards mini Bakers Dozen.",
  howToPlay:"Mini Bakers Dozen is a tiny version of the classic Bakers Dozen, named after the 13 short cascades the original deals. In this mini, 13 face-up cards represent the tops of each of the 13 piles. Tap any card to remove it, scoring 15 points each. You have 22 clicks total.\n\nThe full Bakers Dozen famously buries the four kings at the bottom of their piles to make play harder; the mini abstracts the strategy away in favor of fast, satisfying card removal. Top-pile-only play forces you to sweep horizontally rather than focusing on a single column.\n\nThe full game has surprisingly high win rates (~80%) thanks to clever king placement; here, finishing the layout (clearing all 13) gives you 195 points. A quick, focused, almost meditative micro-solitaire.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniBakerDozenSettings),
  reducer,isTerminal,component:MiniBakerDozenGame,
};
