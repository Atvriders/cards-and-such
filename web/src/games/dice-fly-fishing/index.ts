import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFlyFishingState, DiceFlyFishingAction, DiceFlyFishingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFlyFishingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFlyFishingPlugin: GamePlugin<DiceFlyFishingState, DiceFlyFishingAction, typeof settings> = {
  id:"dice-fly-fishing", title:"Fly Fishing Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fly-fishing river hatch dice: 10 casts, 2 dice per cast.",
  howToPlay:"Fly Fishing Dice distills the fly-fishing river-hatch card game into a quick 10-cast dice game. Each cast you roll two dice; the sum (2-12) represents your cast accuracy and hatch-matching — high rolls are perfect drift and matching mayfly imitation, low rolls are spooked fish or bad knots. Add up totals across all 10 casts for your final score. Fly-fishing simulators are a niche but passionate corner of the sports-sim card-game world, capturing the fly-fishing experience: cast accuracy, mend, drift, hatch identification, fly selection (dry, wet, nymph, streamer), and fish-resistance during the fight. River anglers love them as off-season fixes between real outings. Real fly-fishing card games are deeply granular; this digital mini abstracts it as 2d6. Expected per-cast average 7, total 70 across 10 casts. Hot streaks push 100; cold slip to 50. Press Roll, Next.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFlyFishingSettings),
  reducer,isTerminal,component:DiceFlyFishingGame,
};
