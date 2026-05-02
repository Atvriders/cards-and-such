import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBazaarState, DiceBazaarAction, DiceBazaarSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBazaarGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBazaarPlugin: GamePlugin<DiceBazaarState, DiceBazaarAction, typeof settings> = {
  id:"dice-bazaar", title:"Dice Bazaar", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trade dice in the bazaar — pair-rich hands win across 10 rounds.",
  howToPlay:"Dice Bazaar is a 10-round trading game where pair-rich rolls earn the most coins. Each round you roll five dice; the more matching pips you have, the more bazaar merchants want to trade with you.\n\nYour round score equals 8 points for each die value that appears 2 or more times in your roll. So rolling 1-1-2-2-3 gives you 16 points (two pairs). Rolling 5-5-5-2-3 gives you 8 (one matching set). Rolling all different scores 0. A Yahtzee-like 5 of a kind scores 8 (one matching set across the 5 dice).\n\nPress Roll 5 Dice to throw your hand each round, then Next to move to the next merchant stall. After 10 rounds your bazaar earnings are tallied. Probability of any pair on five dice is ~91%, so you'll hit at least 8 most rounds. Average runs land near 100-130 points; lucky pair-heavy runs push past 180.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBazaarSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-bazaar-roll"]', pulses: 3 }; },
  component:DiceBazaarGame,
};
