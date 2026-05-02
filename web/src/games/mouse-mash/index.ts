import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MouseMashState, MouseMashAction, MouseMashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MouseMashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mouseMashPlugin: GamePlugin<MouseMashState, MouseMashAction, typeof settings> = {
  id:"mouse-mash", title:"Mouse Mash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click scurrying mice as fast as you can. 25-second clicker.",
  howToPlay:"Mouse Mash is a 25-second tap arcade. Mice scurry onto the screen in six lanes — your job is to mash each one with a quick click before they vanish into the wainscoting.\n\nEvery mouse tapped is worth 10 points; missed mice slip away but don't subtract from your score. The board ticks about once per second, with 1-2 new mice spawning each beat in random lanes. With only 25 seconds on the clock — five less than the other arcade clickers — every reaction counts double.\n\nThere's no skill ceiling: the more mice you mash in 25 seconds, the higher your score. Average runs land near 150-250 points; lightning-fingered players pushing 400+ are showing genuine reflex talent. Stay alert and keep your eyes scanning all six lanes.\n\nThe clock counts down in the top right; when it hits zero, your final tally locks in. Squeak squeak — mash those mice!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MouseMashSettings),
  reducer,isTerminal,
  hint: (state: MouseMashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.critters || state.critters.length === 0) return null;
    return { selector: '[data-testid="hint-target-mouse-mash-target"]', pulses: 3 };
  },
  component:MouseMashGame,
};
