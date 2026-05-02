import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeeBuzzState, BeeBuzzAction, BeeBuzzSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BeeBuzzGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const beeBuzzPlugin: GamePlugin<BeeBuzzState, BeeBuzzAction, typeof settings> = {
  id:"bee-buzz", title:"Bee Buzz", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Garden arcade: 30-second bees clicker.",
  howToPlay:"Bee Buzz is a 30-second clicker where bees zip around the meadow in random lanes. Tap each bee to score 10 points before it flies off.\n\nBees spawn 1-2 per tick (about once per second), each one lasting 3-5 ticks before disappearing. Your tap count, seconds remaining, and running score appear at the top of the screen in real time.\n\nThere's no penalty for missed bees beyond the lost points. Just tap fast, tap accurately, and rack up the score. Average runs land at 200-300; great runs go above 500.\n\nBee Buzz is pure reflex. No settings, no strategy — just you, a swarm of buzzing targets, and a 30-second clock. When time runs out, your score is locked in. Catch as many bees as you can before they all buzz off!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BeeBuzzSettings),
  reducer,isTerminal,
  hint: (state: BeeBuzzState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-bee-buzz-target"]', pulses: 3 };
  },
  component:BeeBuzzGame,
};
