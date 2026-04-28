import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKanjamState, DiceKanjamAction, DiceKanjamSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKanjamGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKanjamPlugin: GamePlugin<DiceKanjamState, DiceKanjamAction, typeof settings> = {
  id:"dice-kanjam", title:"Dice Kan Jam", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Frisbee slam-can game; 12 rounds.",
  howToPlay:"Dice Kan Jam simulates the team frisbee sport where one player throws and a partner deflects the disc at a barrel ('kan'). Hits on the barrel score 1, deflected hits in the slot score 2, direct slot-throws (an 'instant win') score 21.\n\nEach of 12 rounds you Roll three dice (one throw plus deflection attempts). Mapping: any 6 in the roll = barrel hit (+1), any pair of 5+6 = deflected slot (+2), all three 6s = direct slot (+21 jackpot). Multiple effects can stack within reason.\n\nA typical round scores 0-2 points; a hot round with paired 5+6 hits can score 4+; the rare jackpot round dominates a game. Twelve rounds totalling 8-15 is normal; a jackpot turn lifts you well past 25.\n\nKan Jam is the breakout American backyard sport of the 2010s, omnipresent at college tailgates and beach cookouts. This mini compresses the team coordination into solo dice play. Press Roll, Next. Quick, modern, and unmistakably summer-cookout-flavoured.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKanjamSettings),
  reducer,isTerminal,component:DiceKanjamGame,
};
