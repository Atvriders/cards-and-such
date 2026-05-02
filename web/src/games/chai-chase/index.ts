import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChaiChaseState, ChaiChaseAction, ChaiChaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChaiChaseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chaiChasePlugin: GamePlugin<ChaiChaseState, ChaiChaseAction, typeof settings> = {
  id:"chai-chase", title:"Chai Chase", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap chai mugs as they appear. 30-second clicker.",
  howToPlay:`Chai Chase is a 30-second clicker arcade. Steaming chai mugs appear on a six-lane board; tap each mug as quickly as you can to drink it for 10 points. Each mug hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe board ticks roughly once per second, spawning fresh mugs in random lanes. The board can quickly fill with spicy targets, so practice your hand-eye coordination and aim carefully — every chai you tap is 10 points closer to a top score.\n\nThere is no skill ceiling: the more mugs you click in 30 seconds, the higher your score. Average runs land near 200-300 points; speedy tappers pushing 500+ are showing real reflex talent. Sip up that chai before it cools!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChaiChaseSettings),
  reducer,isTerminal,
  hint: (state: ChaiChaseState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-chai-chase-target"]', pulses: 3 };
  },
  component:ChaiChaseGame,
};
