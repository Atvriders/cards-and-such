import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BusBashState, BusBashAction, BusBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BusBashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const busBashPlugin: GamePlugin<BusBashState, BusBashAction, typeof settings> = {
  id:"bus-bash", title:"Bus Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click buses crossing the screen. 30-second clicker.",
  howToPlay:`Bus Bash is a 30-second arcade clicker featuring city buses crossing six lanes of road. Tap each bus as fast as you can to score 10 points per tap. Each bus stays on screen for a few ticks before exiting — miss too many and your tally suffers.

The game ticks about once per second, spawning fresh buses in random lanes. The road fills with public transit, so quick reflexes and good aim matter — every bus you tap is 10 points closer to a top score.

There's no skill ceiling: the more buses you tap in 30 seconds, the higher you score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

The wheels on the bus go round and round — make sure you tap before they roll off!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BusBashSettings),
  reducer,isTerminal,
  hint: (state: BusBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-bus-bash-target"]', pulses: 3 };
  },
  component:BusBashGame,
};
