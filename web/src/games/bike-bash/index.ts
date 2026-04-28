import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BikeBashState, BikeBashAction, BikeBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BikeBashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bikeBashPlugin: GamePlugin<BikeBashState, BikeBashAction, typeof settings> = {
  id:"bike-bash", title:"Bike Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click bicycles whizzing past. 30-second clicker.",
  howToPlay:`Bike Bash is a 30-second arcade clicker where bicycles whiz across the screen in six lanes. Tap each bike as fast as you can to score 10 points per tap. Each bike sticks around for a few ticks before pedaling off-screen — miss too many and your tally suffers.

The game ticks about once per second, spawning new bikes in random lanes. The road fills with cyclists, so quick reflexes and good aim matter — every bike you tap is 10 points closer to a top score.

There's no skill ceiling: the more bikes you tap in 30 seconds, the higher you score. Average runs land near 200-300 points; sharp eyes hitting 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

Pedal to the metal!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BikeBashSettings),
  reducer,isTerminal,component:BikeBashGame,
};
