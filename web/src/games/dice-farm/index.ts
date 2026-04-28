import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFarmState, DiceFarmAction, DiceFarmSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFarmGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFarmPlugin: GamePlugin<DiceFarmState, DiceFarmAction, typeof settings> = {
  id:"dice-farm", title:"Dice Farm", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tend the farm with three dice. Sixes are perfect harvest; 10 rounds.",
  howToPlay:"Dice Farm is a 10-round dice mini themed around a small family farm. Each round, you roll three dice representing the day's harvest. Each die shows a face from 1 to 6:\\n\\n- Sixes are perfect golden harvests and score 10 points each.\\n- Other faces (1-5) score nothing.\\n\\nPress Tend to roll the three dice and see the day's results, then press Next to move to the next day's harvest. There's no skill — pure dice fortune.\\n\\nWith 1/6 chance per die of rolling a six, you'll average about 0.5 sixes per round (5 points per round) — about 50 points over 10 rounds. A golden run with multiple sixes per roll can push 90+; a bad season might scrape only 20. Plant your seeds, work the rows, and watch the dice deliver your harvest!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFarmSettings),
  reducer,isTerminal,component:DiceFarmGame,
};
