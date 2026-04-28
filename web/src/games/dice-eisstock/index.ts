import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceEisstockState, DiceEisstockAction, DiceEisstockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceEisstockGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceEisstockPlugin: GamePlugin<DiceEisstockState, DiceEisstockAction, typeof settings> = {
  id:"dice-eisstock", title:"Dice Eisstock", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bavarian curling on ice; 6 ends.",
  howToPlay:"Dice Eisstock simulates Eisstockschiessen — the alpine ice-stock sport played across Bavaria, Austria, Switzerland and northern Italy. Players slide weighted stocks (curling-stone-like discs) along ice toward a target, scoring closest-to-pin like curling or bocce.\n\nEach of 6 ends you Roll four dice (your four stocks). Die values map to closeness rings: 4 = inner ring (3 points), 3 or 5 = middle ring (2 points), 2 or 6 = outer ring (1 point), 1 = wide miss (0).\n\nA typical end scores 5-9 points; hot ends with multiple 4s land 10+; the maximum (four 4s) is 12. Six ends totalling 30-45 is a competitive game; the absolute max is 72.\n\nReal Eisstock is a beloved local sport in alpine villages and a serious competitive discipline at the European championship level. The Bavarian beer-garden version played on summer asphalt rinks is also widely played. This mini compresses the precise ice-glide into dice rolls. Press Roll, Next. Distinctively alpine.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceEisstockSettings),
  reducer,isTerminal,component:DiceEisstockGame,
};
