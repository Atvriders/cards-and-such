import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BobaBounceState, BobaBounceAction, BobaBounceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BobaBounceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bobaBouncePlugin: GamePlugin<BobaBounceState, BobaBounceAction, typeof settings> = {
  id:"boba-bounce", title:"Boba Bounce", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap bouncing boba teas. 25-second tropical clicker.",
  howToPlay:`Boba Bounce is a fast-paced 25-second clicker arcade game. Boba teas (bubble teas) bounce across a six-lane board; tap each one quickly to slurp it for 10 points. Each boba hangs around for a few ticks before bouncing away — miss too many and your score suffers.\n\nThe board ticks roughly once per second, spawning fresh boba in random lanes. The board can fill quickly with chewy pearl targets, so keep your hand-eye coordination sharp and your tap reflexes ready.\n\nThere is no skill ceiling: the more boba you click in 25 seconds, the higher your score. Average runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. Slurp up those pearls!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BobaBounceSettings),
  reducer,isTerminal,component:BobaBounceGame,
};
