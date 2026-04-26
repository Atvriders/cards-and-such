import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MangoTossState, MangoTossAction, MangoTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MangoTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mangoTossPlugin: GamePlugin<MangoTossState, MangoTossAction, typeof settings> = {
  id:"mango-toss", title:"Mango Toss", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Toss mangoes into the crate at the perfect power each round!",
  howToPlay:`Mango Toss challenges you to toss mangoes into a crate at the perfect power. Each round a hidden target is set. Use the slider and press Toss! The closer your power is to the target, the more points you score up to 100 each round. Ten rounds of tossing. Watch how far off you were and adjust. A perfect game scores 1000 points. Aim true and stack up those mangoes!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MangoTossSettings),
  reducer,isTerminal,component:MangoTossGame,
};
