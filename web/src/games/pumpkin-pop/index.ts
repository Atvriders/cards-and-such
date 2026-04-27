import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PumpkinPopState, PumpkinPopAction, PumpkinPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PumpkinPopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pumpkinPopPlugin: GamePlugin<PumpkinPopState, PumpkinPopAction, typeof settings> = {
  id:"pumpkin-pop", title:"Pumpkin Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop bouncing pumpkins across the patch. 30-second clicker.",
  howToPlay:"Pumpkin Pop is a Halloween-themed 30-second clicker arcade. Bouncing jack-o'-lanterns appear across a moonlit pumpkin patch in six lanes; tap each one as fast as you can to pop it for 10 points. Each pumpkin sits for a few ticks before disappearing into the night \u2014 miss too many and your final tally suffers.\n\nThe board ticks roughly once per second, spawning 1 or 2 fresh pumpkins in random lanes. The patch can quickly fill with grinning targets, so practice your hand-eye coordination and aim carefully \u2014 every pumpkin you pop is 10 points closer to a top score.\n\nAverage runs land near 200-300 points; jack-o'-lantern jockeys pushing 500+ are showing real reflex talent. The clock counts down in red at the top right; when it hits zero, your final score is locked in.\n\nTrick or treat? Pure treat \u2014 grab those pumpkins before the witching hour! Perfect for October but festive enough to enjoy any time of year.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PumpkinPopSettings),
  reducer,isTerminal,component:PumpkinPopGame,
};
