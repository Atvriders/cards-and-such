import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDuckpinState, DiceDuckpinAction, DiceDuckpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDuckpinGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDuckpinPlugin: GamePlugin<DiceDuckpinState, DiceDuckpinAction, typeof settings> = {
  id:"dice-duckpin", title:"Dice Duckpin Bowl", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Duckpin: 10 frames, 3 dice avg pins.",
  howToPlay:"Duckpin Dice Bowl simulates the small-pin, small-ball mid-Atlantic bowling sport. Real duckpin uses chunky short pins and a hand-sized ball, with three rolls per frame. Marks are rare even for skilled bowlers.\n\nIn this mini you Roll three six-sided dice each of 10 frames. The frame score is the sum minus 4, capped between 0 and 10. Average per-frame is about 6.5, so typical totals land near 65; a strong streak can clear 85, and a perfect (every die a 6) game would yield 140.\n\nNo strikes, spares, or fill balls in this stripped-down version. Just three quick dice rolls per frame, ten frames, then the final score. Press Roll to bowl, Next for the following frame. Duckpin lanes are a beloved regional curiosity in Maryland, DC and Connecticut — this is your quick-fire taste of that style of pin-bowling without leaving your screen.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDuckpinSettings),
  reducer,isTerminal,component:DiceDuckpinGame,
};
