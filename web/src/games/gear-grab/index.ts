import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GearGrabState, GearGrabAction, GearGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GearGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const gearGrabPlugin: GamePlugin<GearGrabState, GearGrabAction, typeof settings> = {
  id:"gear-grab", title:"Gear Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab gear pieces: 30s clicker.",
  howToPlay:"Gear Grab is a 30-second arcade clicker about snatching gear pieces from a busy workshop. Gear pieces drift across the playfield in five lanes; tap each as fast as you can to grab for 10 points apiece. Each gear hangs around for a few ticks before drifting off: miss too many and your tally suffers.\n\nThe game ticks roughly once per second, spawning fresh gears in random lanes. The board can quickly fill with mechanical components, so practice your hand-eye coordination and aim carefully: every gear grabbed is 10 points closer to a top score.\n\nThere is no skill ceiling: the more gears you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500 or more are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score locks in.\n\nIndustrial chaos, mechanical ballet: Gear Grab is a fast-twitch tester wrapped in a steampunk skin. Grab them all!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GearGrabSettings),
  reducer,isTerminal,component:GearGrabGame,
};
