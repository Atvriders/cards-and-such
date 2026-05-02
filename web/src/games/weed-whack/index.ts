import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WeedWhackState, WeedWhackAction, WeedWhackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WeedWhackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const weedWhackPlugin: GamePlugin<WeedWhackState, WeedWhackAction, typeof settings> = {
  id:"weed-whack", title:"Weed Whack", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Garden arcade: 30-second weeds clicker.",
  howToPlay:"Weed Whack is a 30-second garden clicker where weeds sprout across the meadow and need to be whacked before they spread. Tap each weed for 10 points; ignore them and they wilt away in 3-5 ticks.\n\nNew weeds appear in random lanes 1-2 at a time, every tick (about once per second). Your weed count, seconds left, and live score show at the top of the screen.\n\nThe game has no penalty beyond the missed points — every tap is upside, every miss is just zero. Average runs land near 200-300; sharp clickers can crack 500.\n\nWeed Whack rewards good aim and steady tapping rather than complex strategy. The 30-second timer keeps it brisk and replay-friendly. When time hits zero, your final score is locked in. Clear those weeds before they take over!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WeedWhackSettings),
  reducer,isTerminal,
  hint: (state: WeedWhackState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-weed-whack-target"]', pulses: 3 };
  },
  component:WeedWhackGame,
};
