import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCrokinoleState, DiceCrokinoleAction, DiceCrokinoleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCrokinoleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCrokinolePlugin: GamePlugin<DiceCrokinoleState, DiceCrokinoleAction, typeof settings> = {
  id:"dice-crokinole", title:"Dice Crokinole", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Canadian flick-disc target; 8 ends.",
  howToPlay:"Dice Crokinole simulates the Canadian/Mennonite parlour sport where players flick wooden discs across a polished round board, trying to land in the centre 20-hole or in inner scoring rings while dodging obstacle pegs.\n\nEach of 8 ends you Roll four dice (your four discs). Die values map to scoring rings: 6 = 20-hole (20 points), 5 = inner ring (15 points), 4 = middle ring (10 points), 3 = outer ring (5 points), 1-2 = off the board (0).\n\nA typical end scores 25-45 points; hot ends with 6-5 dice score 60+; the maximum end (four 6s) is 80. Eight ends totalling 200-300 is a normal game; the absolute max is 640.\n\nReal crokinole is fiercely competitive in Mennonite communities of southwestern Ontario and around the World Crokinole Championship in Tavistock. This mini compresses the careful flicking mechanics into pure dice luck while preserving the scoring structure. Press Roll, Next. Quick, distinctively Canadian, and great as a tabletop curiosity.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCrokinoleSettings),
  reducer,isTerminal,component:DiceCrokinoleGame,
};
