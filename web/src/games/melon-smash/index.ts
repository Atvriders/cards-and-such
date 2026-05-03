import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MelonSmashState, MelonSmashAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MelonSmash } from "./MelonSmash.js";
export const melonSmashSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof melonSmashSettings>;
export const melonSmashPlugin:GamePlugin<MelonSmashState,MelonSmashAction,typeof melonSmashSettings> = {
  id:"melon-smash",title:"Melon Smash",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to smash watermelons and score points.",
  howToPlay:`Melon Smash is a fun tapping arcade game. Each round a watermelon appears and you must hit it a target number of times to smash it completely. Tap the button repeatedly to rack up hits until you reach the target count. Smashing a melon earns 10 points. A fresh melon with a new target arrives each round. Play 5, 10, or 15 rounds. Tips: Melons need 3 to 8 hits depending on their size this round. Watch the hit counter carefully. Consistent rhythmic tapping is the key to accurately hitting each target. Summer arcade fun at its finest!`,
  settings:melonSmashSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-melon-smash-action"]', pulses: 3 }; },
  component:MelonSmash,
};
