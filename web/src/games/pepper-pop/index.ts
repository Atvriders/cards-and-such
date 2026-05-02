import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PepperPopState, PepperPopAction, PepperPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PepperPopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pepperPopPlugin: GamePlugin<PepperPopState, PepperPopAction, typeof settings> = {
  id:"pepper-pop", title:"Pepper Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click drifting bell peppers in 30 seconds. Bright, snappy clicker arcade.",
  howToPlay:`Pepper Pop is a colorful 30-second clicker arcade where bell peppers drift through six lanes. Click each one to pop it for 10 points before it slips off-screen.\n\nThe board ticks roughly once per second, spawning fresh peppers in random lanes. Each pepper hangs around for a few ticks before disappearing. Missing one doesn't cost points — you simply don't score that pepper.\n\nThere's no skill ceiling: the more peppers you click in 30 seconds, the higher your score. Average runs land in the 200-300 range; nimble fingers can push past 500.\n\nBell peppers are loaded with vitamin C — more than oranges. Pop, snack, and score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PepperPopSettings),
  reducer,isTerminal,
  hint: (state: PepperPopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-pepper-pop-target"]', pulses: 3 };
  },
  component:PepperPopGame,
};
