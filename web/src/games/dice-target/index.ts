import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTargetState, DiceTargetAction, DiceTargetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTargetGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTargetGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTargetPlugin: GamePlugin<DiceTargetState, DiceTargetAction, typeof settings> = {
  id:"dice-target", title:"Dice Target", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll three dice; aim for a sum of 12. 10 rounds; closer = more points.",
  howToPlay:`Dice Target is a simple aim-and-roll dice mini. Each round you roll three six-sided dice and try to land a total sum of exactly 12 — the statistical sweet spot of three-dice rolls. Hitting 12 dead-on scores 100 points; every point above or below loses you 8 points.

So sums of 11 or 13 each score 92, sums of 10 or 14 score 84, and so on, with anything 12 or more pips off scoring zero. The expected sum of 3d6 is 10.5, so the target of 12 is just slightly above mean — sometimes you'll roll low, sometimes high, sometimes right on the bullseye.

You play 10 rounds. Average expected scores land around 70-75 per round, so a typical 10-round run scores about 700–750. There's no skill — just press Roll, see the dice, watch your score grow, and press Next. A satisfying meditative dice mini.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTargetSettings),
  reducer,
  isTerminal,
  hint: (state: DiceTargetState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-target-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-target-next"]', pulses: 3 };
    return null;
  },
  component:DiceTargetGame,
};
