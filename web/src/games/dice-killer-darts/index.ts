import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKillerDartsState, DiceKillerDartsAction, DiceKillerDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKillerDartsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKillerDartsPlugin: GamePlugin<DiceKillerDartsState, DiceKillerDartsAction, typeof settings> = {
  id:"dice-killer-darts", title:"Dice Killer Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Become a killer; survive 5 lives.",
  howToPlay:"Killer is a multi-player darts elimination game where each player owns a number, must first 'become a killer' by hitting their double, and then attacks others' doubles to drain their lives.\n\nIn this single-player mini you start with 5 lives and roll three dice each of 20 rounds. If your dice contain at least one 6, you take a hit (lose a life). Otherwise you score points equal to the dice sum. The game ends if you reach 0 lives or after 20 rounds.\n\nYour final score equals dice points scored plus 20 per surviving life. A safe game with no 6s preserves all five lives for a +100 bonus; a typical run loses 1-2 lives. Average completed scores land around 200-300.\n\nReal Killer rewards careful target selection and aggression management. This mini compresses the social back-and-forth into a brisk solo survival pattern: the longer you survive, the higher your final score. Press Roll to throw, Next to advance. Quick, tense, and full of darts-bar flavour.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKillerDartsSettings),
  reducer,isTerminal,component:DiceKillerDartsGame,
};
