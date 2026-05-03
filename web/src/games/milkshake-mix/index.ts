import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MilkshakeMixState, MilkshakeMixAction, MilkshakeMixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MilkshakeMixGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const milkshakeMixPlugin: GamePlugin<MilkshakeMixState, MilkshakeMixAction, typeof settings> = {
  id:"milkshake-mix", title:"Milkshake Mix", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mix milkshakes at the perfect blending power to score points!",
  howToPlay:`Milkshake Mix challenges you to blend at the perfect power. Each round a secret target power sets the ideal blend speed. Set your power with the slider and press Mix! The closer to the target, the higher your round score up to 100 points. Ten rounds of blending. Check the feedback after each mix and adjust your slider. A perfect total of 1000 means every milkshake was blended to perfection!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MilkshakeMixSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-milkshake-mix-action"]', pulses: 3 }; },
  component:MilkshakeMixGame,
};
