import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionSeasideState, DominionSeasideAction, DominionSeasideSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionSeasideGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dominionSeasidePlugin: GamePlugin<DominionSeasideState, DominionSeasideAction, typeof settings> = {
  id:"dominion-seaside",
  title:"Dominion Seaside",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Duration cards spanning two turns.",
  howToPlay:"Dominion Seaside is a ten-round small-form tribute to the seafaring Dominion expansion famous for Duration cards that linger between turns. Three cards reveal themselves each round from a fantasy deck — Copper (2), Silver (3), Gold (4), and Estates valued 1 and 5. The sum of those three cards is your score for the round. 🌊\n\nIn the actual Seaside expansion, Duration effects span turns, creating cascading value. This pocket version captures the rhythm by letting cards stack across rounds: average draws cluster near 9 points, but generous draws can break 13. Across ten rounds, totals normally land between 80 and 100.\n\nPress Draw to flip three cards and total, then Next to advance, or Finish on round ten. Reach 100 points to declare victory on the high seas. The game wraps in well under a minute — perfect for quick Seaside-style sessions on a coffee break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DominionSeasideSettings),
  reducer,
  isTerminal,
  component:DominionSeasideGame,
};
