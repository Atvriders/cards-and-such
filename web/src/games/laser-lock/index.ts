import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaserLockState, LaserLockAction, LaserLockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LaserLockGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const laserLockPlugin: GamePlugin<LaserLockState, LaserLockAction, typeof settings> = {
  id:"laser-lock", title:"Laser Lock", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click laser dots locking onto targets. 25-second clicker.",
  howToPlay:"Laser Lock is a 25-second sci-fi clicker arcade. Targeting lasers paint the board across six grid lanes; tap each red dot before it cycles off for 10 points apiece. Each lock hangs around for a few ticks — let too many fade and your final tally suffers.\n\nThe grid ticks every 750ms, spawning fresh laser locks in random lanes. The targeting zone can quickly fill with active dots, so practice your hand-eye coordination and aim carefully — every laser you confirm is one more kill-shot logged and 10 points closer to a top score.\n\nThere's no skill ceiling: the more laser dots you click in 25 seconds, the higher your score. Average runs land near 180-260 points; sharpshooters pushing 400+ are real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nAcquire, lock, fire — every dot counts!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LaserLockSettings),
  reducer,isTerminal,component:LaserLockGame,
};
