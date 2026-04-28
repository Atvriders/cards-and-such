import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardJamState, CardJamAction, CardJamSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardJamGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardJamPlugin: GamePlugin<CardJamState, CardJamAction, typeof settings> = {
  id:"card-jam", title:"Card Jam", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Jam cards into 4 jam jars by suit: 16 cards.",
  howToPlay:"Card Jam pours 16 random cards through your hands one at a time. Four jam jars sit at the bottom, one for each suit. Tap the matching jar to score 12 points; tap the wrong jar and earn nothing. There is no penalty for mismatches besides the missed points.\n\nThe card on display shows its suit clearly via symbol and color (red for hearts and diamonds, black for spades and clubs). Just match it to the correct jar and the next card flips up automatically. The 16-card deal continues until every card has been jammed, then your final score is locked in.\n\nMaximum possible score is 192 (16 times 12). Pay attention: under speed pressure it is easy to mistap a red jar for the wrong red suit. Card Jam is a quick reflex-and-recognition game; finishing with 150 or more means your suit recognition is razor sharp.\n\nSort fast, sort right, and keep that jam flowing!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardJamSettings),
  reducer,isTerminal,component:CardJamGame,
};
