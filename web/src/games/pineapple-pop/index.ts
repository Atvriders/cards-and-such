import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineapplePopState, PineapplePopAction, PineapplePopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineapplePopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pineapplePopPlugin: GamePlugin<PineapplePopState, PineapplePopAction, typeof settings> = {
  id:"pineapple-pop", title:"Pineapple Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop pineapples as they appear. 30-second arcade.",
  howToPlay:"Pineapple Pop is a tropical 30-second clicker arcade. Spiky pineapples drift across the screen in six lanes; tap each one as fast as you can to pop it for 10 points. Each pineapple hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh pineapples in random lanes. The board can quickly fill with spiky targets, so practice your hand-eye coordination and aim carefully — every pineapple you pop is 10 points closer to a top score.\n\nThere's no skill ceiling: the more pineapples you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nQuick fingers and tropical vibes — Pineapple Pop is calling!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PineapplePopSettings),
  reducer,isTerminal,
  hint: (state: PineapplePopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-pineapple-pop-target"]', pulses: 3 };
  },
  component:PineapplePopGame,
};
