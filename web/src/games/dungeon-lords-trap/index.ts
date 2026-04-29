import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DungeonLordsTrapState, DungeonLordsTrapAction, DungeonLordsTrapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DungeonLordsTrapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dungeonLordsTrapPlugin: GamePlugin<DungeonLordsTrapState, DungeonLordsTrapAction, typeof settings> = {
  id:"dungeon-lords-trap",
  title:"Dungeon Lords Trap",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Manage a dungeon; draft action cards, trap heroes.",
  howToPlay:"Dungeon Lords Trap is a ten-round dungeon-management card game inspired by CGE's Dungeon Lords, where you build a labyrinth and trap heroes who delve too deep. Each round, three cards reveal from a dungeon deck: Imp (2), Trap (4), Monster (5), Tunnel (3), Boss (6). The sum is your round score. 👹\n\nThe deck averages 12 per round; Boss pulls boost rounds to 15+. Imp-heavy rounds drop to 6. Across ten rounds expect totals near 100 to 130.\n\nPress Draw to flip three dungeon cards, Next to advance the year, and Finish on round ten. Aim for 130+ for an evil dungeon master's score. The game completes in well under a minute, distilling Dungeon Lords' dungeon-building atmosphere into a brisk pocket-sized card flipper that captures the original's villainous fun.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DungeonLordsTrapSettings),
  reducer,
  isTerminal,
  component:DungeonLordsTrapGame,
};
