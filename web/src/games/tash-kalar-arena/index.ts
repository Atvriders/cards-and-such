import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TashKalarArenaState, TashKalarArenaAction, TashKalarArenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TashKalarArenaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tashKalarArenaPlugin: GamePlugin<TashKalarArenaState, TashKalarArenaAction, typeof settings> = {
  id:"tash-kalar-arena",
  title:"Tash-Kalar Arena",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pattern-matching summoner card game.",
  howToPlay:"Tash-Kalar Arena is a ten-round summoner card game inspired by Vlaada Chvátil's Tash-Kalar: Arena of Legends, where pieces are placed in patterns to summon legendary creatures. Each round, three cards are revealed from a faction-themed deck: Recruit (2), Hero (4), Champion (6), Relic (3), Spell (5). The sum is your round score. ⚔️\n\nWithout the actual board patterns, this version captures the summoning rhythm: average draws hit 12 per round, with Champion-rich rounds reaching 18. Across ten rounds expect totals between 100 and 130.\n\nPress Draw to reveal cards, Next to summon onward, and Finish on round ten. 130+ marks an excellent campaign. The whole game completes in well under a minute, distilling the legendary creature-summoning vibe into a brisk, repeatable session you can fit into any short break or pocket of free time you have.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TashKalarArenaSettings),
  reducer,
  isTerminal,
  component:TashKalarArenaGame,
};
