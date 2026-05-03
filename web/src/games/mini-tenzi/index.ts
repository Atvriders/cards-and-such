import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniTenziState, MiniTenziAction, MiniTenziSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniTenziGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniTenziPlugin: GamePlugin<MiniTenziState, MiniTenziAction, typeof settings> = {
  id:"mini-tenzi", title:"Mini Tenzi", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Get all 10 dice to show the same number using as few rolls as possible.",
  howToPlay:`Mini Tenzi is a single-round speed dice game. You have ten six-sided dice. The target is fixed by your initial roll (the most-common face). Your goal: get all ten dice showing the target number as quickly as possible.

Dice matching the target on each roll are auto-held (gold border). Tap any die to manually toggle its hold. Press Roll Unheld to re-roll all dice that aren't held.

You have up to 30 rolls; if you run out, you score partial credit (5 points per matched die). Hit TENZI within 30 rolls and you score 100 + 10×(unused rolls), so finishing in 6 rolls = 340 pts, in 15 rolls = 250 pts. A live timer shows your speed.

Average completion is around 12 rolls; lucky games finish in 5; unlucky droughts can take 20+. Don't unhold dice unless you're switching targets.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniTenziSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if ((state as any).phase !== "play") return null;
    return { selector: '[data-testid="hint-target-mini-tenzi-roll"]', pulses: 3 };
  },
  component:MiniTenziGame,
};
