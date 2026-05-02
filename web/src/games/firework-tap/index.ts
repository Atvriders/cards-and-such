import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FireworkTapState, FireworkTapAction, FireworkTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FireworkTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fireworkTapPlugin: GamePlugin<FireworkTapState, FireworkTapAction, typeof settings> = {
  id:"firework-tap", title:"Firework Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap fireworks bursting across the night sky. 30-second clicker.",
  howToPlay:"Firework Tap is a festive 30-second clicker arcade. Sparkling fireworks burst across a midnight-blue sky in six lanes; tap each one as fast as you can to capture it for 10 points. Each firework hangs around for a few ticks before it fizzles out \u2014 miss too many and your final tally suffers.\n\nThe board ticks roughly once per second, spawning 1 or 2 fresh bursts in random lanes. The screen fills quickly during a sustained barrage, so practice your hand-eye coordination and aim carefully \u2014 every burst you catch is 10 points closer to a top score.\n\nAverage runs land near 200-300 points; sharp-eyed pyromaniacs pushing 500+ are showing real reflex talent. The clock counts down in red at the top right; when it hits zero, your final score is locked in.\n\nWhether it's New Year's Eve, the Fourth of July, or just any night you want to celebrate something, this clicker is a quick festive blast. Light it up!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FireworkTapSettings),
  reducer,isTerminal,
  hint: (state: FireworkTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".fc-target", pulses: 3 };
  },
  component:FireworkTapGame,
};
