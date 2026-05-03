import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTrapezeState, DiceTrapezeAction, DiceTrapezeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTrapezeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTrapezeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTrapezePlugin: GamePlugin<DiceTrapezeState, DiceTrapezeAction, typeof settings> = {
  id:"dice-trapeze", title:"Dice Trapeze", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Time the trapeze swing — predict whether dice match or differ.",
  howToPlay:"Dice Trapeze is a tiny circus act. Each round you pick a direction for your trapeze: Match (the two dice will roll the same number, a doubles \"catch\") or Differ (the two dice will land different — a graceful pass). After your choice, the dice tumble and the result is evaluated.\n\nMatch scores 30 points if correct (it's harder — only ~17% chance), Differ scores 10 points if correct (more common at ~83%). Wrong calls score zero. After 10 rounds your final tally lands.\n\nStrategy is simple: differ is the safe, low-paying win; match is the risky, high-reward call. Reading a few \"near-miss\" pairs in a row sometimes tempts a Match — but the dice don't remember. Time your swings carefully and try to land the trapeze!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTrapezeSettings),
  reducer,isTerminal,component:DiceTrapezeGame,
  hint: (state: DiceTrapezeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "predict") return { selector: '[data-testid="hint-target-dicetrapeze-predict"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dicetrapeze-next"]', pulses: 3 };
    return null;
  },
};
