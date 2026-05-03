import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceShootoutState, DiceShootoutAction, DiceShootoutSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceShootoutGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceShootoutGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceShootoutPlugin: GamePlugin<DiceShootoutState, DiceShootoutAction, typeof settings> = {
  id:"dice-shootout", title:"Dice Shootout", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"1v1 dice duel vs AI. First to 100.",
  howToPlay:"Dice Shootout is a head-to-head duel against an AI opponent. Each round, both you and the AI roll one six-sided die simultaneously. The higher die scores its value for that player. Ties score nothing for either side.\n\nThe first player to reach 100 wins. Press \"Roll Both\" to roll on each turn — the dice resolve instantly, points are added, and the running totals update on screen.\n\nSince the dice are rolled simultaneously and resolved by simple comparison, the game is symmetric: roughly 5/12 chance of each player winning a roll, 1/6 tie. Over many rolls, the totals balance, but variance can give either side big swings.\n\nFinal score: if you win, you get 100 + your total; if the AI wins, your final score is just your accumulated total. So winning is worth a healthy bonus. Average game length is 30-50 rounds.\n\nStrategy: there isn't any. Just keep clicking and let the dice decide your fate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceShootoutSettings),
  reducer,isTerminal,
    hint: (state: DiceShootoutState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-dice-shootout-action"]', pulses: 3 };
    },
  component:DiceShootoutGame,
};
