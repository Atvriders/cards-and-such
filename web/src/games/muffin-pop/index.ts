import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MuffinPopState, MuffinPopAction, MuffinPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MuffinPopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const muffinPopPlugin: GamePlugin<MuffinPopState, MuffinPopAction, typeof settings> = {
  id:"muffin-pop", title:"Muffin Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop muffins from the tin at the perfect force for maximum points!",
  howToPlay:`Muffin Pop challenges you to pop baked muffins from the tin at the perfect force. Each round a secret target power is set. Adjust the slider and press Pop! to release the muffins. Points depend on how close you are to the target up to 100 per round. Ten rounds total. Use feedback to improve your aim. A perfect 1000-point score means every muffin popped flawlessly. Precise power control wins the bakery!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MuffinPopSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-muffin-pop-action"]', pulses: 3 }; },
  component:MuffinPopGame,
};
