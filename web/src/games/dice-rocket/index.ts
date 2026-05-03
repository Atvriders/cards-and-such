import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRocketState, DiceRocketAction, DiceRocketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceRocketGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceRocketGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRocketPlugin: GamePlugin<DiceRocketState, DiceRocketAction, typeof settings> = {
  id:"dice-rocket", title:"Dice Rocket", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Boost a rocket up to altitude 100 with a single d6 — fewer rolls means a better score.",
  howToPlay:`Dice Rocket is a single-die climb to altitude 100. Each press of BOOST rolls a six-sided die and adds the result to your altitude. The rocket's display rises proportionally as you climb.

Your goal is to reach 100 in as few rolls as possible. The minimum is 17 rolls (you'd need an average of 5.88 per roll — luckily a sustained streak of fives and sixes); the expected number of rolls is around 28–30 since the average die is 3.5.

Score: if you reach 100 within the 25-roll cap, you score 500 minus 10 per roll, with a 50-point floor. So a 17-roll dream run scores 330. If you run out at 25 rolls without reaching 100, you score whatever altitude you reached (typically 70–90).

Strategy: there's no strategy — it's pure dice. But that's the fun. Press BOOST and watch the d6 deliver fortunes high or low. Doubles, triples, blinds, all of it lives in the laps of probability.

Liftoff!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRocketSettings),
  reducer, isTerminal, 
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-rocket-roll"]', pulses: 3 }; },
  component: DiceRocketGame,
};
