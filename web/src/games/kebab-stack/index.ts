import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KebabStackState, KebabStackAction, KebabStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KebabStackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kebabStackPlugin: GamePlugin<KebabStackState, KebabStackAction, typeof settings> = {
  id:"kebab-stack", title:"Kebab Stack", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stack kebab skewers at the perfect power for maximum points!",
  howToPlay:`Kebab Stack is a precision arcade game. Each round a secret target power is set. Adjust the slider to your desired power and press Go! to stack the next skewer. The closer your power is to the hidden target, the more points you earn up to 100 per round. Ten rounds total. Watch the diff feedback and adjust each attempt. A perfect game scores 1000 points — nail every target!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KebabStackSettings),
  reducer,isTerminal,component:KebabStackGame,
};
