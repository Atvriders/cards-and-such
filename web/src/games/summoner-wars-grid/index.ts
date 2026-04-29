import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SummonerWarsGridState, SummonerWarsGridAction, SummonerWarsGridSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SummonerWarsGridGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const summonerWarsGridPlugin: GamePlugin<SummonerWarsGridState, SummonerWarsGridAction, typeof settings> = {
  id:"summoner-wars-grid",
  title:"Summoner Wars Grid",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Faction card combat on a battle grid.",
  howToPlay:"Summoner Wars Grid is a ten-round faction-themed card game homage to Plaid Hat Games' Summoner Wars, where summoners deploy warriors on a tactical grid. Each round, three cards reveal from a faction deck: Recruit (2), Hero (4), Champion (6), Relic (3), Spell (5). The total is your round score. 🛡️\n\nThe deck has a balanced spread; per-round averages hover around 12 points. Champion-heavy rounds reach 18; Recruit-heavy rounds dip to 6. Across ten rounds expect 100 to 130.\n\nPress Draw to reveal cards, Next to advance the battle, and Finish on round ten. Aim for 130+ for a victorious summoner. The game completes in well under a minute, distilling the grid-combat tension into pocket-sized card draws while preserving the flavour of warlord-vs-warlord clashes that fans love about the original tabletop release.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SummonerWarsGridSettings),
  reducer,
  isTerminal,
  component:SummonerWarsGridGame,
};
