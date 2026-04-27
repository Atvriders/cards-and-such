import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniSpider1suitState, MiniSpider1suitAction, MiniSpider1suitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniSpider1suitGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniSpider1suitPlugin: GamePlugin<MiniSpider1suitState, MiniSpider1suitAction, typeof settings> = {
  id:"mini-spider-1suit", title:"Mini Spider 1-Suit", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"One-suit Spider mini with 4 cascades.",
  howToPlay:"Mini Spider 1-Suit is a tiny, friendly version of the classic Spider solitaire — but with only one suit, making it the most beginner-accessible Spider variant. Four cascades hold 16 face-up cards from a 26-card half deck.\n\nTap any card to remove it from the layout. In real Spider you'd build descending ranked sequences down the cascades and complete a full A-K run to \"lift\" it off the table; here you simply lift cards one at a time and score 15 points per remove.\n\nYou have 30 clicks to chisel through the layout. Aiming for sequence in your tap order isn't required — just clear as many cards as you can.\n\nAverage completion lands near 240 points; full clearance maxes around 240 points (16 cards × 15). A perfect 1-minute Spider warm-up that doesn't ask much of your attention.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniSpider1suitSettings),
  reducer,isTerminal,component:MiniSpider1suitGame,
};
