import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JuiceJamboreeState, JuiceJamboreeAction, JuiceJamboreeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JuiceJamboreeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const juiceJamboreePlugin: GamePlugin<JuiceJamboreeState, JuiceJamboreeAction, typeof settings> = {
  id:"juice-jamboree", title:"Juice Jamboree", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click juice glasses before they spill. 30s clicker.",
  howToPlay:"Juice Jamboree is a 30-second juice-glass clicker. Glasses of fresh juice drift across six lanes; tap each glass quickly to score 10 points. Each glass hangs around for a few ticks before it tips over and is gone forever — miss too many and your score will suffer.\n\nThe board pulses with new spawns each tick (about once per second), so the screen fills up fast. There is no skill ceiling beyond reaction time and accuracy: keep clicking and the points add up. Average runs land in the 200–300 range; sharpshooters can push beyond 500.\n\nThe clock ticks down in the top right. When time runs out, your final tally is locked in. Hit the glasses, dodge the spills, and become the orchard's quickest-handed champion!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JuiceJamboreeSettings),
  reducer,isTerminal,component:JuiceJamboreeGame,
};
