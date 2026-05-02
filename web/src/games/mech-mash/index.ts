import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MechMashState, MechMashAction, MechMashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MechMashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mechMashPlugin: GamePlugin<MechMashState, MechMashAction, typeof settings> = {
  id:"mech-mash", title:"Mech Mash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mash giant mech buttons: 30s clicker.",
  howToPlay:"Mech Mash is a 30-second mech-themed arcade clicker. Giant mech buttons appear across five lanes; tap each as fast as you can to mash for 12 points apiece. Each button hangs around for a few ticks before fading: miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh mech targets in random lanes. The board can fill quickly with fierce mechanical icons, so keep your taps quick and your aim crisp.\n\nThere is no skill ceiling: the more mechs you mash in 30 seconds, the higher you climb. Average runs land near 240-360 points; sharpshooters pushing 500 or more are flexing real reflex talent. The clock counts down in the top right; when it hits zero, your final score locks in.\n\nWhether you are channeling Pacific Rim or Mobile Suit Gundam, Mech Mash gives you 30 seconds to flex your tap-fu. Mash those mechs, lock that score, and try to top your previous runs!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MechMashSettings),
  reducer,isTerminal,
  hint: (state: MechMashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-mech-mash-target"]', pulses: 3 };
  },
  component:MechMashGame,
};
