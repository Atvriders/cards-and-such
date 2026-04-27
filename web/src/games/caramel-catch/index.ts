import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaramelCatchState, CaramelCatchAction, CaramelCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CaramelCatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const caramelCatchPlugin: GamePlugin<CaramelCatchState, CaramelCatchAction, typeof settings> = {
  id:"caramel-catch", title:"Caramel Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch sticky caramel pieces in your basket \u2014 30-second sweet clicker.",
  howToPlay:"Caramel Catch is a sticky 30-second clicker arcade. Soft, golden pieces of caramel drift across six lanes of a confectioner's playfield; tap each piece as fast as you can to catch it in your basket for 10 points. Each caramel is on screen for only a few ticks before stickily slipping away.\n\nThe game ticks roughly once per second, spawning fresh caramel in random lanes. The conveyor belt of sweets keeps moving, so practice your tapping cadence and keep your eyes wide open. Every caramel you catch is 10 sweet points closer to a top score.\n\nNo strategy, just speed and accuracy. The more caramels you catch in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters push 500+ on hot rounds. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nGet ready, get set, catch caramels!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CaramelCatchSettings),
  reducer,isTerminal,component:CaramelCatchGame,
};
