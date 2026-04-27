import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DonutDashState, DonutDashAction, DonutDashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DonutDashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const donutDashPlugin: GamePlugin<DonutDashState, DonutDashAction, typeof settings> = {
  id:"donut-dash", title:"Donut Dash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click donuts on the conveyor. 25-second sprint.",
  howToPlay:`Donut Dash is a 25-second bakery conveyor clicker. Glazed donuts ride the conveyor across the screen in six lanes; tap each one before it slides off the end. Each donut dashed scores 10 points.

The game ticks once per second; new donuts spawn each tick in random lanes. Donuts have only a few ticks of screen time before they disappear — miss too many and your score takes a hit. Donut Dash is shorter and tighter than other bakery arcades, so every second counts.

There is no skill ceiling — the more donuts you click in 25 seconds, the higher your score. Average runs sit around 150-250 points; pros push 400+. The clock counts down in the corner; when it hits zero, your donut tally is locked in.

Ready, set, dash!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DonutDashSettings),
  reducer,isTerminal,component:DonutDashGame,
};
