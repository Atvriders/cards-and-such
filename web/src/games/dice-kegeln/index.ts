import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKegelnState, DiceKegelnAction, DiceKegelnSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKegelnGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKegelnPlugin: GamePlugin<DiceKegelnState, DiceKegelnAction, typeof settings> = {
  id:"dice-kegeln", title:"Dice Kegeln", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"German Kegeln 9-pin bowling, 10 frames.",
  howToPlay:"Dice Kegeln simulates German nine-pin bowling — sometimes called Bohle or Asphalt depending on the alley surface. Kegeln is genuinely competitive in central and northern Europe, with leagues, championships and a quirky pin-leave culture all its own.\n\nEach of 10 frames you Roll two six-sided dice; the frame total equals the sum minus 1, capped between 0 and 9. Expected per-frame is around 6, so most games total between 50 and 70. A hot night can crack 80, and the theoretical max — eleven every frame — is 90.\n\nIn real kegeln the pins are arranged in a diamond rather than a triangle, balls are smaller than American ten-pin, and a 'Pudel' (gutter ball) is a moment of public shame. This mini abstracts all that into pure dice — Roll for pins, Next for the following frame. Quick Bavarian-flavoured bowling without leaving the keyboard.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKegelnSettings),
  reducer,isTerminal,component:DiceKegelnGame,
};
