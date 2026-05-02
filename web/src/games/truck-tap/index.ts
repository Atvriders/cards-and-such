import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TruckTapState, TruckTapAction, TruckTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TruckTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const truckTapPlugin: GamePlugin<TruckTapState, TruckTapAction, typeof settings> = {
  id:"truck-tap", title:"Truck Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click trucks rolling past. 30-second clicker.",
  howToPlay:`Truck Tap is a 30-second arcade clicker featuring big rigs rolling across the screen. Tap each truck as fast as you can to score 10 points per tap. Trucks stick around for a few ticks before rumbling out of frame — miss too many and your score takes a hit.

The game ticks about once per second, spawning fresh trucks in random lanes from a six-lane highway. The road fills with cargo, so reflexes and aim matter — every truck you tap is 10 points closer to a top score.

There's no skill ceiling: the more trucks you tap in 30 seconds, the higher you score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

Keep on truckin'!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TruckTapSettings),
  reducer,isTerminal,
  hint: (state: TruckTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".ttp-target", pulses: 3 };
  },
  component:TruckTapGame,
};
