import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCandlepinState, DiceCandlepinAction, DiceCandlepinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCandlepinGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCandlepinPlugin: GamePlugin<DiceCandlepinState, DiceCandlepinAction, typeof settings> = {
  id:"dice-candlepin", title:"Dice Candlepin Bowl", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Candlepin: 10 frames, 3 rolls per frame = pins.",
  howToPlay:"Candlepin Dice Bowl is a New England-style bowling sim. In real candlepin you bowl with thin, candle-shaped pins and get three balls per frame instead of two; deadwood stays in the lane. We mirror this with three dice per frame, where each die represents pins from one ball.\n\nEach frame you Roll three dice; their sum (3 to 18) is pins for the frame, capped at 10. Add ten frame totals for your score; an average game lands near 70 and a hot run can clear 90.\n\nReal candlepin is famously the hardest bowling discipline — even pros rarely break 200 because the thin pins and deadwood make 10-pin marks rare. This mini doesn't model that brutal difficulty; instead it gives you the rhythm of three rolls per frame in a satisfying compressed format. Quick, regional, and a nice change from standard ten-pin sims.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCandlepinSettings),
  reducer,isTerminal,component:DiceCandlepinGame,
};
