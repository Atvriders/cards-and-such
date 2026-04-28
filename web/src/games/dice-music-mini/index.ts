import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMusicMiniState, DiceMusicMiniAction, DiceMusicMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMusicMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMusicMiniPlugin: GamePlugin<DiceMusicMiniState, DiceMusicMiniAction, typeof settings> = {
  id:"dice-music-mini", title:"Dice Music Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to compose — the sum is your tune's value!",
  howToPlay:`Dice Music Mini is a 10-round dice game with a music composition theme. Each round, you roll a single six-sided die. The roll value is your score for that round — 1 through 6. Higher rolls represent more notes in your composition.

Press Roll Die for each round. The expected average roll is 3.5, so over 10 rounds your typical score is around 35. The minimum possible is 10 (all 1s); the maximum is 60 (all 6s). Most runs land between 25 and 45.

There are no choices, just press Roll Die for each round and let the music play. After 10 rounds, your composition is complete and the final score is locked in. There's something pleasingly minimalist about this game — a small accumulation of pure dice luck. Compose your masterpiece!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMusicMiniSettings),
  reducer,isTerminal,component:DiceMusicMiniGame,
};
