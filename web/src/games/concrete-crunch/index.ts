import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConcreteCrunchState, ConcreteCrunchAction, ConcreteCrunchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConcreteCrunchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const concreteCrunchPlugin: GamePlugin<ConcreteCrunchState, ConcreteCrunchAction, typeof settings> = {
  id:"concrete-crunch", title:"Concrete Crunch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click concrete blocks to crunch them. 30-second clicker.",
  howToPlay:"Concrete Crunch is a 30-second demolition-themed arcade clicker. Concrete blocks rumble across the screen in six lanes; tap each block as fast as you can to crunch it into rubble for 10 points. Miss them and they roll past unscored.\n\nThe board ticks roughly once per second, spawning fresh blocks in random lanes. As construction sites pile up around you, the screen fills with chunks of concrete to demolish — every tap is a point.\n\nThere's no skill ceiling: the more blocks you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent.\n\nThe clock counts down in the top right; when it hits zero, your final score is locked in. Crunch through the cement and rack up those points — the wrecking crew is counting on you!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ConcreteCrunchSettings),
  reducer,isTerminal,component:ConcreteCrunchGame,
};
