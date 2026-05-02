import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanAviaryState, WingspanAviaryAction, WingspanAviarySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanAviaryGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wingspanAviaryPlugin: GamePlugin<WingspanAviaryState, WingspanAviaryAction, typeof settings> = {
  id:"wingspan-aviary",
  title:"Wingspan Aviary",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Attract birds to your aviary.",
  howToPlay:"Wingspan Aviary is a 10-round bird-collecting card game. Each round, three Bird cards are drawn from a fantasy deck: Sparrow (2), Robin (3), Owl (5), Hawk (6), and Phoenix (9). Sum their wingspans for your round score. 🐦\n\nFlocking bonus: if any two birds in a round share the same value (a flock!), you earn a 4-point bonus. Phoenixes are rare and majestic. Average rounds score about 11 to 14. Across 10 rounds, expect totals near 120 to 170.\n\nPress Draw to attract three birds to your aviary, then Next to continue birdwatching. Each bird shows its species and wingspan value. Score 150+ to become the Wingspan Aviary master. Inspired by the bird-themed engine builder, this small card variant captures its quiet, meditative joy in a quick run finishing in well under a minute. Gentle, peaceful, and full of feathered fantasy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WingspanAviarySettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-wingspan-aviary-primary"]', pulses: 3 }),
  component:WingspanAviaryGame,
};
