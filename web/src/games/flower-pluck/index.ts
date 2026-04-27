import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlowerPluckState, FlowerPluckAction, FlowerPluckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlowerPluckGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const flowerPluckPlugin: GamePlugin<FlowerPluckState, FlowerPluckAction, typeof settings> = {
  id:"flower-pluck", title:"Flower Pluck", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Garden arcade: 30-second flowers clicker.",
  howToPlay:"Flower Pluck is a 30-second clicker game. Wildflowers bloom in random lanes across the meadow; tap each to pluck it for 10 points before it wilts and drifts away.\n\nThe game spawns 1-2 fresh blooms every tick (about once per second). Each flower lasts 3-5 ticks, so you have a small window to grab it. Miss too many and your score suffers.\n\nThere's no penalty for missed flowers beyond the lost points — your score is purely a sum of pluck successes. Average runs land in the 200-300 point range; quick reflexes can push 500+.\n\nThe top of the screen shows your pluck count, the seconds remaining, and your running score in real time. When the timer hits zero, your final score locks in. There's no skill ceiling and no settings — pure tap-and-go fun. Click those flowers and rack up points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FlowerPluckSettings),
  reducer,isTerminal,component:FlowerPluckGame,
};
