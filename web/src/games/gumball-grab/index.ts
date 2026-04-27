import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GumballGrabState, GumballGrabAction, GumballGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GumballGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const gumballGrabPlugin: GamePlugin<GumballGrabState, GumballGrabAction, typeof settings> = {
  id:"gumball-grab", title:"Gumball Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch colorful gumballs raining down \u2014 30-second sweet clicker.",
  howToPlay:"Gumball Grab is a fast and bouncy 30-second clicker arcade. Round, colorful gumballs rain down from a candy machine in six lanes; tap each one as it falls to grab it for 10 points. Each gumball is only on screen for a few ticks before bouncing away \u2014 fast fingers win the day.\n\nThe game ticks roughly once per second, spawning fresh gumballs in random lanes. The board fills quickly when the machine is going strong, so trust your reflexes and keep tapping. Every gumball you catch is 10 points closer to a top score.\n\nNo strategy, just speed. The more gumballs you grab in 30 seconds, the higher your score. Average runs land near 200-300 points; expert clickers push 500+ on a hot run. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nKeep grabbing those gumballs!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GumballGrabSettings),
  reducer,isTerminal,component:GumballGrabGame,
};
