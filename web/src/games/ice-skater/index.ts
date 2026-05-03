import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IceSkaterState, IceSkaterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IceSkater } from "./IceSkater.js";
export const iceSkaterSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof iceSkaterSettings>;
export const iceSkaterPlugin:GamePlugin<IceSkaterState,IceSkaterAction,typeof iceSkaterSettings> = {
  id:"ice-skater",title:"Ice Skater",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap rapidly to complete ice skating spins and score points.",
  howToPlay:`Ice Skater puts you in the boots of a figure skater attempting rapid spins. Each round a target number of taps is set — representing how many push-offs are needed to complete a full spin. Tap the button repeatedly until you reach the target count. Completing a spin earns 10 base points. There is no time limit, but each extra tap beyond the target reduces your bonus slightly — aim to hit it exactly! After completing each spin, a new target is set for the next round. Play 5, 10, or 15 rounds. Tips: Count your taps carefully to avoid over-tapping. Higher targets (7 or 8) are worth the same base points as lower ones, so tap steadily and stay focused.`,
  settings:iceSkaterSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ice-skater-action"]', pulses: 3 }; },
  component:IceSkater,
};
