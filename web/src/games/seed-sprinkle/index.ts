import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeedSprinkleState, SeedSprinkleAction, SeedSprinkleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeedSprinkleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const seedSprinklePlugin: GamePlugin<SeedSprinkleState, SeedSprinkleAction, typeof settings> = {
  id:"seed-sprinkle", title:"Seed Sprinkle", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Garden arcade: 25-second seeds clicker.",
  howToPlay:"Seed Sprinkle is a 25-second clicker where seeds rain down across the planting bed in random lanes. Tap each seed before it falls past your reach to plant it for 10 points.\n\nThe board spawns 1-2 fresh seeds per tick. Each seed only sticks around 3-5 ticks, so you have a brief window to catch it. Once it disappears, it's gone for good — but no penalty beyond the missed point.\n\nYour seed count, the timer, and your score update in real time at the top of the screen. The game is fully timer-based: when the 25 seconds expire, your final tally is locked in.\n\nThere's no skill ceiling or settings — pure click-and-collect gameplay. Average scores land near 180; quick reflexes push 350+. Plant those seeds and grow your high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SeedSprinkleSettings),
  reducer,isTerminal,component:SeedSprinkleGame,
};
