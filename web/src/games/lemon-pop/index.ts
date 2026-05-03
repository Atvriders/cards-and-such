import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LemonPopState, LemonPopAction, LemonPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LemonPopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lemonPopPlugin: GamePlugin<LemonPopState, LemonPopAction, typeof settings> = {
  id:"lemon-pop", title:"Lemon Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop lemons into the juicer at the perfect angle for max points!",
  howToPlay:`Lemon Pop is an aiming arcade game. Each round set the slider power and press Pop! to squeeze a lemon. The secret target determines ideal power. Closer to target means more points up to 100 per round. Ten rounds of lemon-popping action. Adjust after each round based on diff feedback. A perfect 1000 score means hitting every target exactly. Sour precision is the name of the game!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LemonPopSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-lemon-pop-action"]', pulses: 3 }; },
  component:LemonPopGame,
};
