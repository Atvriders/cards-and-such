import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoffeeCollectState, CoffeeCollectAction, CoffeeCollectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoffeeCollectGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const coffeeCollectPlugin: GamePlugin<CoffeeCollectState, CoffeeCollectAction, typeof settings> = {
  id:"coffee-collect", title:"Coffee Collect", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap coffee beans as they fall. 30-second clicker.",
  howToPlay:`Coffee Collect is a 30-second clicker arcade game. Coffee beans appear on a six-lane board; tap each bean as fast as you can to collect it for 10 points. Each bean hangs around for a few ticks before bouncing off — miss too many and your score suffers.\n\nThe board ticks roughly once per second, spawning fresh beans in random lanes. The board can fill quickly with brown targets, so keep your hand-eye coordination sharp.\n\nThere is no skill ceiling: the more beans you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharp tappers pushing 500+ are showing real reflex talent. Brew that bonus and rack up the points!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CoffeeCollectSettings),
  reducer,isTerminal,
  hint: (state: CoffeeCollectState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-coffee-collect-target"]', pulses: 3 };
  },
  component:CoffeeCollectGame,
};
