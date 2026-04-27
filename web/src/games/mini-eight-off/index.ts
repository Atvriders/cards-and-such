import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniEightOffState, MiniEightOffAction, MiniEightOffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniEightOffGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniEightOffPlugin: GamePlugin<MiniEightOffState, MiniEightOffAction, typeof settings> = {
  id:"mini-eight-off", title:"Mini Eight Off", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Eight Off mini with 4 free cells and 4 cascades.",
  howToPlay:"Mini Eight Off is a compact rendering of the classic Eight Off solitaire — a Freecell-cousin where the player has eight free cells (instead of four) for staging cards. The mini reduces the layout to 4 cells and 4 small cascades totaling 16 cards. Tap any card to lift it from play, scoring 15 points per click.\n\nYou have 25 clicks total. Eight Off is one of the most-winnable Freecell variants in the family (~96% solvable for full deals); the mini keeps the easygoing feel without bogging you down with stacking rules. Focus on clearing the visible card stack and racking up clicks.\n\nA full clearance scores 240 points. Average runs land in the 200-230 point range. Quick, tactile, and forgiving — perfect for a brain stretch on a coffee break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniEightOffSettings),
  reducer,isTerminal,component:MiniEightOffGame,
};
