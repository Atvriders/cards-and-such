import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceAimState, DiceAimAction, DiceAimSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceAimGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceAimPlugin: GamePlugin<DiceAimState, DiceAimAction, typeof settings> = {
  id:"dice-aim", title:"Dice Aim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two dice as darts; aim for a low total.",
  howToPlay:"Dice Aim is a darts-style accuracy challenge. Each round, you roll two six-sided dice; their sum is added to your score. There are 8 rounds total. Lower scores are better in real darts, but here higher is better — every pip counts.\n\nThe expected sum per roll is 7 (with the classic bell-curve distribution). Across 8 rounds the average final score is around 56; great runs push 80+. Press Roll, see your dice, press Next to advance.\n\nThis is a simplified rebrand of \"darts as dice\" mechanic — instead of throwing physical darts, your dice represent throws at a target. Casual, low-stakes, and rhythmically satisfying. Maximum theoretical score is 96 (all sixes). A great quick warm-up between heavier dice rounds.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceAimSettings),
  reducer,isTerminal,component:DiceAimGame,
};
