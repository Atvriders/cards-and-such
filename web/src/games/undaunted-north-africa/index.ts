import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UndauntedNorthAfricaState, UndauntedNorthAfricaAction, UndauntedNorthAfricaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UndauntedNorthAfricaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const undauntedNorthAfricaPlugin: GamePlugin<UndauntedNorthAfricaState, UndauntedNorthAfricaAction, typeof settings> = {
  id:"undaunted-north-africa",
  title:"Undaunted North Africa",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Undaunted sequel; raids in desert campaigns.",
  howToPlay:"Undaunted North Africa is a ten-round desert-warfare card game homage to the Undaunted sequel set in WWII's Western Desert raids. Each round, three cards reveal from a deck of soldiers and operations: Recon (3), Lorry (4), Sapper (2), Officer (5), Raid (6). The total is your round score. 🐫\n\nThe deck averages 12 per round; Raid pulls boost rounds to 15+. Sapper-heavy rounds dip to 7. Across ten rounds expect totals near 100 to 130. The desert raids are quick and decisive.\n\nPress Draw to flip three squad cards, Next to advance the raid, and Finish on round ten. Score 130+ to outflank the Afrika Korps. The game completes in well under a minute, distilling Undaunted: North Africa's desert maneuvers into a pocket-sized card flipper that retains all the original's flavour.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UndauntedNorthAfricaSettings),
  reducer,
  isTerminal,
  component:UndauntedNorthAfricaGame,
};
