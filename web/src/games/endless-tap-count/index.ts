import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EndlessTapCountState, EndlessTapCountAction, EndlessTapCountSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EndlessTapCountGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const endlessTapCountPlugin: GamePlugin<EndlessTapCountState, EndlessTapCountAction, typeof settings> = {
  id:"endless-tap-count", title:"Endless Tap Count", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hyper-casual speed-tap clicker counting tap targets.",
  howToPlay:"Endless Tap Count is a thirty-second hyper-casual speed-tap clicker. Tap targets appear across six lanes — tap each target as fast as possible before it disappears to score ten points. Missed targets age out and count against your accuracy. The screen ticks about once per second, with one or two fresh targets spawning per tick. Each target only stays visible for a few ticks before fading. The timer counts down from thirty seconds in the upper-right corner. With its bright purple aesthetic and finger-pointing emoji, Endless Tap Count celebrates the joy of pure tap-to-score speed gameplay. Average runs net 220-300 points; speed-tap virtuosos clear 380+ regularly. Empty-space taps are free of penalty, so attack the screen with rapid-fire multi-taps when several targets appear at once. When the timer hits zero, the field goes still and your final score is locked in. Just tap. Faster!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EndlessTapCountSettings),
  reducer,isTerminal,
  hint: (state: EndlessTapCountState) => state.phase === "done" ? null : ({ selector: ".etptcnt-btn", pulses: 3 }),
  component:EndlessTapCountGame,
};
