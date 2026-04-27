import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniCanfieldState, MiniCanfieldAction, MiniCanfieldSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniCanfieldGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniCanfieldPlugin: GamePlugin<MiniCanfieldState, MiniCanfieldAction, typeof settings> = {
  id:"mini-canfield", title:"Mini Canfield", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Canfield mini with random foundation start rank.",
  howToPlay:"Mini Canfield is a streamlined version of the classic 19th-century Canfield solitaire. Thirteen cards are dealt face-up forming the reserve and tableau. The full game pairs a random foundation rank from which all four foundations build sequentially, but this mini simplifies the structure: tap any visible card to lift it, scoring 15 points per click.\n\nYou have 25 clicks to clear as many cards as possible. The original Canfield is famous for its low win rate (~3%) — this mini removes the strict rules to focus on the satisfying ritual of taking the layout apart card by card.\n\nAverage scores hover around 200-250 points with strategic clicking. A nostalgic, low-pressure throwback to one of the most famous casino solitaires of the gilded age. Quick, elegant, and addictive.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniCanfieldSettings),
  reducer,isTerminal,component:MiniCanfieldGame,
};
