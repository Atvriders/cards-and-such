import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCarromState, DiceCarromAction, DiceCarromSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCarromGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCarromPlugin: GamePlugin<DiceCarromState, DiceCarromAction, typeof settings> = {
  id:"dice-carrom", title:"Dice Carrom", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"South Asian flick-disc boardsport; 9 ends.",
  howToPlay:"Dice Carrom simulates the South Asian board sport where players flick small wooden discs ('carrom men') with their fingers, trying to pocket their colour and the special red 'Queen' before opponents.\n\nEach of 9 ends you Roll three dice (your three flick attempts). Die values map: 6 = pocketed Queen (5 points), 5 = pocketed your colour (3 points), 4 = pocketed plus follow-up (2 points), 3 = pocketed (1 point), 1-2 = miss (0).\n\nA typical end scores 4-7 points; a hot end with multiple 5-6s can score 10+; the maximum (three 6s) is 15. Nine ends totalling 35-55 is a normal game; the absolute max is 135.\n\nReal carrom is hugely popular across India, Pakistan, Bangladesh, Sri Lanka and Nepal, with international tournaments and intense club rivalries. This mini distils the flick-and-pocket rhythm into compact dice play. Press Roll, Next. Quick, deeply South Asian, and full of board-skill flavour.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCarromSettings),
  reducer,isTerminal,component:DiceCarromGame,
};
