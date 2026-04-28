import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicalDropMiniState, MagicalDropMiniAction, MagicalDropMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MagicalDropMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const magicalDropMiniPlugin: GamePlugin<MagicalDropMiniState, MagicalDropMiniAction, typeof settings> = {
  id:"magical-drop-mini", title:"Magical Drop Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Whimsical sparkle match-3 with falling stars.",
  howToPlay:"Magical Drop Mini is a sixty-second match-three filled with sparkling celestial objects — twinkles, stars, comets, and shooting stars on a magical six-by-six grid. Click two adjacent stars to swap them. If the swap creates a horizontal or vertical run of three or more identical stars, those celestial objects vanish in a cascading sparkle for ten points apiece. New stars fall in from above and frequently trigger chain cascades for huge bonus points. Invalid swaps cancel without using a turn. With just five star types, matches happen quickly, but high-scoring runs require setting up specific four- or five-in-a-row clears. The timer counts down sixty seconds at the top. Average runs land at 300-380 points; magical cascade-hunters easily clear 500+. When the clock hits zero, the board locks and your final score is yours. Sparkle, swap, and clear the night sky!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MagicalDropMiniSettings),
  reducer,isTerminal,component:MagicalDropMiniGame,
};
