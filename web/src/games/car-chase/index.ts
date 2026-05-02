import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarChaseState, CarChaseAction, CarChaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarChaseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const carChasePlugin: GamePlugin<CarChaseState, CarChaseAction, typeof settings> = {
  id:"car-chase", title:"Car Chase", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click cars zooming across the road. 30-second clicker.",
  howToPlay:`Car Chase is a fast-paced 30-second clicker arcade. Cars race across a six-lane road; tap each car as fast as you can to score 10 points per tap. Each car only stays on screen for a few ticks before exiting — miss too many and your final score takes a hit.

The board ticks roughly once per second, spawning fresh cars in random lanes. The road can fill up quickly with traffic, so practice your reflexes and aim — every car you click is 10 points closer to the leaderboard.

There's no skill ceiling: the more cars you tap in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

Mash that screen and rev up some points!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CarChaseSettings),
  reducer,isTerminal,
  hint: (state: CarChaseState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-car-chase-target"]', pulses: 3 };
  },
  component:CarChaseGame,
};
