import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CookieClutchState, CookieClutchAction, CookieClutchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CookieClutchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cookieClutchPlugin: GamePlugin<CookieClutchState, CookieClutchAction, typeof settings> = {
  id:"cookie-clutch", title:"Cookie Clutch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click cookies before they crumble. 30-second clicker.",
  howToPlay:`Cookie Clutch is a 30-second bakery clicker. Cookies appear on the screen in random positions; tap each one before it crumbles and disappears. Each cookie clicked scores 10 points.

New cookies spawn each tick (about once per second), and they only stay around for a few ticks before crumbling. Miss too many and your score lags behind. The board can fill up fast — fast fingers and accurate aim are your friends here.

There's no skill ceiling — the more cookies you click in 30 seconds, the higher your score. Average runs land in the 200-300 range; sharpshooters can push 500+. The clock counts down at the top; when it hits zero, your final cookie tally is locked in.

Get clicking before they crumble away!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CookieClutchSettings),
  reducer,isTerminal,
  hint: (state: CookieClutchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-cookie-clutch-target"]', pulses: 3 };
  },
  component:CookieClutchGame,
};
