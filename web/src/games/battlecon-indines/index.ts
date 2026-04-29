import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BattleconIndinesState, BattleconIndinesAction, BattleconIndinesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BattleconIndinesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const battleconIndinesPlugin: GamePlugin<BattleconIndinesState, BattleconIndinesAction, typeof settings> = {
  id:"battlecon-indines",
  title:"BattleCON Indines",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card-driven 1v1 fighter with simultaneous reveal.",
  howToPlay:"BattleCON Indines is a ten-round 1v1 fighter card game inspired by Level 99 Games' BattleCON: War of Indines, where simultaneous card reveals drive combat. Each round, three cards reveal from a fighter-themed deck: Style (3), Base (4), Combo (5), Dodge (2), Finisher (6). The sum gives your round score. 🥊\n\nThe deck has fighter-game range; averages hit 12 per round. Finisher pulls reach 14+, Dodge-heavy rounds slip to 7. Across ten rounds expect totals near 100 to 130.\n\nPress Draw to reveal three combat cards, Next to advance the duel, and Finish on round ten. Aim for 130+ for a fight worthy of Indines' arenas. The game completes in well under a minute, distilling the card-fighter feel into a brisk, replayable pocket version of the cult classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BattleconIndinesSettings),
  reducer,
  isTerminal,
  component:BattleconIndinesGame,
};
