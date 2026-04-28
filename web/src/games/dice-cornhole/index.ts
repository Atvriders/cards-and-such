import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCornholeState, DiceCornholeAction, DiceCornholeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCornholeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCornholePlugin: GamePlugin<DiceCornholeState, DiceCornholeAction, typeof settings> = {
  id:"dice-cornhole", title:"Dice Cornhole", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Beanbag toss; 9 frames, 4 bags each.",
  howToPlay:"Dice Cornhole simulates the wildly popular American backyard sport where players toss bean bags at an angled board with a hole. A bag in the hole scores 3, a bag on the board scores 1, a bag on the ground scores 0.\n\nEach of 9 frames you Roll four dice (your four bags). Die values map: 6 = bag in hole (3 points), 4-5 = bag on board (1 point), 1-3 = ground miss (0 points).\n\nA typical frame scores 4-7 points; a clean frame with multiple 6s can score 10+; the max (four 6s) is 12. Nine frames totalling 35-55 is a strong game; the absolute max is 108.\n\nReal cornhole has a huge American Cornhole League circuit with cash prizes and televised matches. The sport's mix of casual backyard accessibility and high-skill ceiling has driven explosive growth. This mini abstracts toss accuracy into pure dice but keeps the rhythm — four bags per frame, nine frames, totals matter. Press Roll, Next. Quick, recognisably-American, and addictively low-friction.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCornholeSettings),
  reducer,isTerminal,component:DiceCornholeGame,
};
