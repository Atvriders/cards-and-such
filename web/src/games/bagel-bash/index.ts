import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BagelBashState, BagelBashAction, BagelBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BagelBashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bagelBashPlugin: GamePlugin<BagelBashState, BagelBashAction, typeof settings> = {
  id:"bagel-bash", title:"Bagel Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click drifting bagels. 30-second clicker.",
  howToPlay:`Bagel Bash is a 30-second New York-style deli clicker. Bagels drift across the screen in random lanes; tap each one before it floats away. Each bagel bashed scores 10 points.

The game ticks once per second, with 1-2 new bagels spawning per tick. Bagels stay on screen for a few ticks before disappearing — miss too many and your score lags behind.

There's no skill ceiling — the more bagels you click in 30 seconds, the higher your score. Average runs land near 200-300 points; arcade pros chase 500+. The clock counts down in the top-right corner; when it hits zero, your final bagel count is locked in.

Get bashing before those bagels roll past you!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BagelBashSettings),
  reducer,isTerminal,
  hint: (state: BagelBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-bagel-bash-target"]', pulses: 3 };
  },
  component:BagelBashGame,
};
