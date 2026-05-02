import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EndlessCatchState, EndlessCatchAction, EndlessCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EndlessCatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const endlessCatchPlugin: GamePlugin<EndlessCatchState, EndlessCatchAction, typeof settings> = {
  id:"endless-catch", title:"Endless Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap falling apples to catch them before they hit ground.",
  howToPlay:"Endless Catch is a thirty-second falling-fruit clicker where apples drop through six lanes — tap each apple before it hits the ground to catch it for ten points. Missed apples age out and count against your accuracy. The orchard ticks about once per second, with one or two fresh apples falling per tick. Each apple only descends for a few ticks before splatting. The timer counts down from thirty seconds in the upper-right corner. Average runs net 220-300 points; orchard-savvy reflex masters routinely score 380+. Empty-space taps are free of penalty, so attack the field aggressively when many apples appear at once. With its warm autumn-orchard aesthetic, Endless Catch combines a comforting farm vibe with sharp reflex gameplay. When the timer hits zero, the orchard goes still and your final score is locked in. Catch every apple — pies don't bake themselves!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EndlessCatchSettings),
  reducer,isTerminal,hint: (state: EndlessCatchState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-endless-catch-primary"]', pulses: 3 } : null,component:EndlessCatchGame,
};
