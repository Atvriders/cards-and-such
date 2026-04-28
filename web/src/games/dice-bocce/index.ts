import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBocceState, DiceBocceAction, DiceBocceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBocceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBoccePlugin: GamePlugin<DiceBocceState, DiceBocceAction, typeof settings> = {
  id:"dice-bocce", title:"Dice Bocce", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Italian target ball; 6 ends, 4 balls each.",
  howToPlay:"Dice Bocce simulates the Italian lawn-target sport where players take turns rolling weighted balls toward a small target ball (the 'pallino'), trying to land closest. After every player has thrown, the closest ball's team scores 1 point per ball closer than the opponent's nearest.\n\nEach of 6 ends you Roll four dice (one per bocce ball). Distance from the pallino is simulated as |dice - 3.5|; closer dice (3 or 4) score better. Each die that rolls a 3 or 4 earns 2 points, a 2 or 5 earns 1, and 1s and 6s earn nothing.\n\nA typical end produces 3-5 points; a strong end with multiple 3-4 dice can score 7-8. Six ends totalling 25-35 is a normal game; a perfect 8-points-every-end run gives a maximum of 48. Real bocce is famous in Italian-American clubs and Mediterranean parks, played seriously with measuring tools at high levels. This mini compresses ten minutes of careful underhand throwing into six quick rolls.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBocceSettings),
  reducer,isTerminal,component:DiceBocceGame,
};
