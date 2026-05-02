import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKnightQuestState, DiceKnightQuestAction, DiceKnightQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKnightQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKnightQuestPlugin: GamePlugin<DiceKnightQuestState, DiceKnightQuestAction, typeof settings> = {
  id:"dice-knight-quest", title:"Dice Knight Quest", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll for the knight's quest. Score by sum.",
  howToPlay:"Dice Knight Quest is a 10-round dice-rolling game where score is simply the sum of two six-sided dice. 🛡️ Each round, you press Roll Dice and two dice tumble across the screen. Add the pips: that's your round score.\n\nSums range from 2 (snake eyes) to 12 (boxcars), with 7 the most common roll. Across 10 rounds the average expected total lands near 70 points. There's no strategy — it's pure luck — but each roll has its own dramatic feel.\n\nPress Next after each result to continue, or Finish on the final round. Watch your running score climb in the upper right. Great for quick mini-game breaks: the whole game is over in well under a minute. A high score depends on the seed and a little fortune. Roll well, friends.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKnightQuestSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-knight-quest-roll"]', pulses: 3 }; },
  component:DiceKnightQuestGame,
};
