import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaintPopState, PaintPopAction, PaintPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaintPopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const paintPopPlugin: GamePlugin<PaintPopState, PaintPopAction, typeof settings> = {
  id:"paint-pop", title:"Paint Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop drifting paint splatters before they dry. 25-second clicker.",
  howToPlay:"Paint Pop is a 25-second workshop-themed clicker. Paint splatters drift across the workshop in six lanes; tap each one quickly to pop it for 10 points per hit. Each splatter is wet for only a few ticks before it dries onto the wall — miss too many and the cleanup is on you.\\n\\nThe board ticks roughly once per second, spawning fresh splatters in random lanes. The wall can quickly fill with colorful targets, so keep your eyes sharp and your taps accurate. There's no skill ceiling — the more splatters you pop in 25 seconds, the higher your score.\\n\\nAverage runs land near 170-250 points; sharp eyes pushing 400+ are showing real flick speed. The clock counts down in the top right; when it hits zero, your final score is locked in. Pop, pop, pop!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PaintPopSettings),
  reducer,isTerminal,
  hint: (state: PaintPopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-paint-pop-target"]', pulses: 3 };
  },
  component:PaintPopGame,
};
