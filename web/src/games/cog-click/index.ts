import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CogClickState, CogClickAction, CogClickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CogClickGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cogClickPlugin: GamePlugin<CogClickState, CogClickAction, typeof settings> = {
  id:"cog-click", title:"Cog Click", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click spinning cogs: 30s clicker.",
  howToPlay:"Cog Click is a 30-second mechanical-themed arcade clicker. Spinning cogs drift across the playfield in five lanes; tap each as fast as you can to click for 8 points apiece. Each cog hangs around for a few ticks before disappearing: miss too many and your tally suffers.\n\nThe game ticks roughly once per second, spawning fresh cogs in random lanes. The board can quickly fill with rotating gears, so practice your hand-eye coordination and aim carefully: every cog clicked is 8 points closer to a top score.\n\nThere is no skill ceiling: the more cogs you click in 30 seconds, the higher your score. Average runs land near 160-240 points; sharpshooters pushing 400 or more are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score locks in.\n\nSteampunk vibes, mechanical mayhem: Cog Click rewards quick, focused tapping. Get those gears before they spin off into oblivion!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CogClickSettings),
  reducer,isTerminal,component:CogClickGame,
};
