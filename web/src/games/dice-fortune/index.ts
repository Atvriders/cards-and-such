import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFortuneState, DiceFortuneAction, DiceFortuneSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFortuneGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceFortuneGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFortunePlugin: GamePlugin<DiceFortuneState, DiceFortuneAction, typeof settings> = {
  id:"dice-fortune", title:"Dice Fortune", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll a die and multiply by a lucky multiplier. 10 rounds.",
  howToPlay:"Dice Fortune is a luck-amplifying minigame. Each of the 10 rounds you press Spin to roll a single die and simultaneously generate a \"lucky multiplier\" between 1x and 5x. Your score for the round equals the die face times the multiplier — so a 6 with a 5x multiplier nets 30 points, while a 1 with 1x earns just 1.\n\nThe multiplier is uniformly random across {1,2,3,4,5}, so the expected per-round haul is 3.5 (face) times 3 (multiplier) = 10.5 points. Across 10 rounds, average runs land near 90-110, with high variance — luck is everything here.\n\nAfter Spin, the result is displayed and points awarded. Press Next to advance to the next round. There's no skill, no strategy, just hope the dice gods favor you with high faces and big multipliers!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFortuneSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFortuneState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "spinning") return { selector: '[data-testid="hint-target-dice-fortune-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-fortune-next"]', pulses: 3 };
    return null;
  },
  component:DiceFortuneGame,
};
