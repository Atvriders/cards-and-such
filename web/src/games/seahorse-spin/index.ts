import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeahorseSpinState, SeahorseSpinAction, SeahorseSpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeahorseSpinGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const seahorseSpinPlugin: GamePlugin<SeahorseSpinState, SeahorseSpinAction, typeof settings> = {
  id:"seahorse-spin", title:"Seahorse Spin", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click drifting seahorses for 30 seconds.",
  howToPlay:"Seahorse Spin is a 30-second clicker arcade with an underwater theme. Seahorses drift up onto the screen across six lanes; tap each one as fast as you can to catch it. Every tap scores 10 points.\n\nEach critter hangs around for a few ticks before drifting off — miss too many and your tally suffers. The board ticks roughly once per second, spawning fresh targets in random lanes. The board can fill up quickly, so practice your hand-eye coordination and aim carefully.\n\nThere's no skill ceiling: the more clicks you land in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nThe game tracks both Caught and Missed totals so you can see your accuracy. Aim for fast and accurate hands. There's no penalty for a wild click that hits empty water — only for letting critters slip away. Splash through the deep!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SeahorseSpinSettings),
  reducer,isTerminal,
  hint: (state: SeahorseSpinState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.critters || state.critters.length === 0) return null;
    return { selector: '[data-testid="hint-target-seahorse-spin-target"]', pulses: 3 };
  },
  component:SeahorseSpinGame,
};
