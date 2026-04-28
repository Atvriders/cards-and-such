import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePortalState, DicePortalAction, DicePortalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePortalGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePortalPlugin: GamePlugin<DicePortalState, DicePortalAction, typeof settings> = {
  id:"dice-portal", title:"Dice Portal", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dice opens portals to bonus rounds — 10 rounds.",
  howToPlay:"Dice Portal is a quick dice game with simple, satisfying scoring. Each round, two six-sided dice are rolled, and points are awarded based on the result.\n\nDoubles open a portal worth 30 + 2x face; otherwise score is 2x sum. 10 rounds.\n\nPress Roll to play the round, then press Next to advance. There are no choices — every game is pure variance, but watching the score climb makes it irresistible. Try to chase a personal best by replaying with different seeds.\n\nTotal score depends on how often the dice cooperate. Some rounds will pay zero, others will pay big. With multiple rounds you'll usually average something in the middle of the range — but a hot streak can push your run far higher. Roll, watch, repeat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePortalSettings),
  reducer,isTerminal,component:DicePortalGame,
};
