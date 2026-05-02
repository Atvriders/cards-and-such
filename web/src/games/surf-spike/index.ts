import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SurfSpikeState, SurfSpikeAction, SurfSpikeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SurfSpikeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const surfSpikePlugin: GamePlugin<SurfSpikeState, SurfSpikeAction, typeof settings> = {
  id:"surf-spike", title:"Surf Spike", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap waves cresting through the lineup. 25-second arcade.",
  howToPlay:"Surf Spike is a faster, 25-second tropical clicker arcade. Waves crest across the screen in six lanes; tap each one as fast as you can to ride it for 10 points. Each wave hangs around for a few ticks before passing — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh waves in random lanes. The board can quickly fill with cresting targets, so practice your hand-eye coordination and aim carefully — every wave you tap is 10 points closer to a top score.\n\nThe 25-second timer makes this one a sprint compared to its 30-second siblings. There's no skill ceiling: the more waves you click in 25 seconds, the higher your score. Average runs land near 170-250 points; sharpshooters pushing 400+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nHang ten and rack up those wave points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SurfSpikeSettings),
  reducer,isTerminal,
  hint: (state: SurfSpikeState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-surf-spike-target"]', pulses: 3 };
  },
  component:SurfSpikeGame,
};
