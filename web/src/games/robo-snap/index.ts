import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RoboSnapState, RoboSnapAction, RoboSnapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RoboSnapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const roboSnapPlugin: GamePlugin<RoboSnapState, RoboSnapAction, typeof settings> = {
  id:"robo-snap", title:"Robo Snap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click robotic arms: 30s clicker.",
  howToPlay:"Robo Snap is a 30-second arcade clicker. Robotic arms drift across the playfield in five vertical lanes; tap each robot as fast as you can to snap it for 10 points. Each robot hangs around for a few ticks before drifting off-board: miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh robots in random lanes. The board can quickly fill with mechanical targets, so practice your hand-eye coordination and aim carefully: every robot you snap is 10 points closer to a top score.\n\nThere is no skill ceiling: the more robots you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500 or more are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nGet those robotic arms before they wander off! Mash the screen and rack up those snap points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RoboSnapSettings),
  reducer,isTerminal,
  hint: (state: RoboSnapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".fc-target", pulses: 3 };
  },
  component:RoboSnapGame,
};
