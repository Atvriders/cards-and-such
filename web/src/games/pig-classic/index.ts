import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PigClassicState, PigClassicAction, PigClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PigClassicGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PigClassicGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pigClassicPlugin: GamePlugin<PigClassicState, PigClassicAction, typeof settings> = {
  id:"pig-classic", title:"Pig Classic", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll until you bank or hit a 1; race to 100. Classic press-your-luck dice.",
  howToPlay:`Pig Classic is the timeless press-your-luck dice game distilled to one player. The goal: race to 100 points before you run out of turns.

Each turn, you roll a single die. If you roll 2-6, that number adds to your turn total. You can keep rolling for more, OR press Bank to lock in your turn total and end the turn safely. The catch: if you roll a 1, your turn total is wiped (the "pigged" 1) and the turn ends with zero added.

Strategy is everything. Each roll has a 1-in-6 chance of busting your turn total — so the bigger your turn total, the more you stand to lose. Most casual players bank around 20; aggressive players push for 30+. The race is to reach 100 banked total, which usually takes around 5-7 successful turns.

You have up to 30 turns to reach the target. Reach 100 and the game ends; otherwise, your final banked score is whatever you accumulated. Good luck — and don't get too greedy!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PigClassicSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    const tt = (state as any).turnTotal ?? 0;
    if (tt >= 20) return { selector: '[data-testid="hint-target-pig-classic-bank"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-pig-classic-roll"]', pulses: 3 };
  },
  component:PigClassicGame,
};
