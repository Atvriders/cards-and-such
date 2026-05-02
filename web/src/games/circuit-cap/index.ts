import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CircuitCapState, CircuitCapAction, CircuitCapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CircuitCapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const circuitCapPlugin: GamePlugin<CircuitCapState, CircuitCapAction, typeof settings> = {
  id:"circuit-cap", title:"Circuit Cap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap circuit nodes: 25s clicker.",
  howToPlay:"Circuit Cap is a 25-second arcade clicker themed on electrical circuits. Bright circuit nodes pulse across five lanes; tap each as fast as you can to cap for 12 points apiece. Each node hangs around for a few ticks before fizzling out: miss too many and your tally suffers.\n\nFive seconds shorter than most clickers in the catalog, Circuit Cap demands sharper focus. The game ticks roughly once per second, spawning fresh circuit nodes in random lanes. The board can quickly fill with electric components, so keep your taps quick and your aim crisp.\n\nThere is no skill ceiling: the more nodes you cap in 25 seconds, the higher your score. Average runs land near 200-280 points; sharpshooters pushing 400 or more are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score locks in.\n\nSparks fly, points climb: Circuit Cap is a brief, intense tap-fest with a tech-noir vibe. Cap those circuits and conduct yourself to a high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CircuitCapSettings),
  reducer,isTerminal,
  hint: (state: CircuitCapState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-circuit-cap-target"]', pulses: 3 };
  },
  component:CircuitCapGame,
};
