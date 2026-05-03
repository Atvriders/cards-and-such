import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTrailState, DiceTrailAction, DiceTrailSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTrailGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTrailGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTrailPlugin: GamePlugin<DiceTrailState, DiceTrailAction, typeof settings> = {
  id:"dice-trail", title:"Dice Trail", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 5 dice: count ascending adjacent pairs.",
  howToPlay:"Dice Trail rolls 5 dice each round across 8 rounds. The game counts how many adjacent pairs are in strictly ascending pip order (left-to-right). Each ascending pair scores 10 points. Maximum per round is 40 points (4 ascending pairs).\n\nPress Roll 5 to trail your dice. Press Next to advance to the next round. The dice positions are random, so any roll could go monotonic up, monotonic down, or zigzag.\n\nFor a true ascending trail (like 1-2-3-4-5 or 2-3-4-5-6), all 4 adjacent pairs ascend: but those rolls are extremely rare (about 0.1 percent of rolls). Average expected ascending pairs per roll is about 2 (since each adjacent pair has roughly 42 percent chance of ascending, accounting for ties), giving 20 points per round and 160 across 8 rounds.\n\nThere is no choice, no skill: Dice Trail is pure dice-flopping fun. Roll, count those rising sequences, and rack up the points. Look for the rare full-trail rounds for that 40-point thrill!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTrailSettings),
  reducer,
  isTerminal,
  hint: (state: DiceTrailState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-trail-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-trail-next"]', pulses: 3 };
    return null;
  },
  component:DiceTrailGame,
};
