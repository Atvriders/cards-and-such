import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RobotRescueState, RobotRescueAction, RobotRescueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RobotRescueGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const robotRescuePlugin: GamePlugin<RobotRescueState, RobotRescueAction, typeof settings> = {
  id:"robot-rescue", title:"Robot Rescue", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click rescue robots beaming in. 30-second clicker.",
  howToPlay:"Robot Rescue is a 30-second sci-fi clicker arcade. Rescue droids beam down across six pickup lanes; tap each robot before it teleports out for 10 points apiece. Each unit hangs around for a few ticks — let too many slip back to base and your final tally suffers.\n\nThe rescue grid ticks every 750ms, spawning fresh robots in random lanes. The mission zone can quickly fill with friendly units, so practice your hand-eye coordination and aim carefully — every robot you grab is one more soul saved and 10 points closer to a top score.\n\nThere's no skill ceiling: the more robots you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nTap, rescue, repeat — beam them home!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RobotRescueSettings),
  reducer,isTerminal,component:RobotRescueGame,
};
