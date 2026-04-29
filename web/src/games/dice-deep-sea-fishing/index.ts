import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDeepSeaFishingState, DiceDeepSeaFishingAction, DiceDeepSeaFishingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDeepSeaFishingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDeepSeaFishingPlugin: GamePlugin<DiceDeepSeaFishingState, DiceDeepSeaFishingAction, typeof settings> = {
  id:"dice-deep-sea-fishing", title:"Deep Sea Fishing Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deep-sea big-game fishing dice: 10 catches, 3 dice per catch.",
  howToPlay:"Deep Sea Fishing Dice distills the ocean big-game-fishing card game into a quick 10-catch dice game. Each catch you roll three dice; the sum (3-18) represents your big-game outcome — high rolls land marlins or tuna, low rolls lose lines or break tackle. Add up totals across all 10 catches for your final score. Deep-sea-fishing card games simulate Atlantic and Pacific big-game targets — blue marlin, yellowfin tuna, mako shark, swordfish, sailfish, mahi-mahi — and the long fights to land them. They model rod tension, drag settings, fish stamina, and angler endurance, capturing the multi-hour real-life big-game fight in 30-60 minute card sessions. Real deep-sea fishing card games are deeply granular; this digital mini abstracts it as 3d6. Expected per-catch average 10.5, total 105 across 10 catches. Hot streaks push 140; cold slip to 70. Press Roll, Next. Quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDeepSeaFishingSettings),
  reducer,isTerminal,component:DiceDeepSeaFishingGame,
};
