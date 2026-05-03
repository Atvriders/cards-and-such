import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarshmallowGrabState, MarshmallowGrabAction, MarshmallowGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarshmallowGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const marshmallowGrabPlugin: GamePlugin<MarshmallowGrabState, MarshmallowGrabAction, typeof settings> = {
  id:"marshmallow-grab", title:"Marshmallow Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab marshmallows at exactly the right speed for top points!",
  howToPlay:`Marshmallow Grab challenges your precision. Each round a hidden target power determines the ideal grab speed. Set your grab speed with the slider and press Grab! The closer to the target, the more points up to 100. Ten rounds of marshmallow madness. Check the diff after each grab and fine-tune your next attempt. A perfect 1000-point game means hitting every target exactly. Soft precision is your goal!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MarshmallowGrabSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-marshmallow-grab-action"]', pulses: 3 }; },
  component:MarshmallowGrabGame,
};
