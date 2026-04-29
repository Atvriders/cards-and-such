import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KeyforgeArchonsState, KeyforgeArchonsAction, KeyforgeArchonsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KeyforgeArchonsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const keyforgeArchonsPlugin: GamePlugin<KeyforgeArchonsState, KeyforgeArchonsAction, typeof settings> = {
  id:"keyforge-archons",
  title:"Keyforge Archons",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Faction-driven unique-deck card game.",
  howToPlay:"Keyforge Archons is a ten-round faction-themed card game inspired by Richard Garfield's Keyforge: Call of the Archons, the unique-deck game where each deck is one-of-a-kind. Each round, three cards reveal from a deck of houses: Brobnar (3), Dis (4), Logos (5), Mars (2), Untamed (6). The total is your round score. 🔑\n\nWith mid-range faction values, the deck averages around 12 per round. Untamed-heavy rounds reach 18; Mars-heavy rounds dip to 8. Across ten rounds expect totals near 100 to 130.\n\nPress Draw to reveal three faction cards, Next to forge onward, and Finish on round ten. Aim for 130+ to forge all three keys. The game completes in well under a minute and captures Keyforge's signature unique-deck rhythm in a streamlined, replayable, pocket-friendly card session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KeyforgeArchonsSettings),
  reducer,
  isTerminal,
  component:KeyforgeArchonsGame,
};
