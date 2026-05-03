import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDominoState, DiceDominoAction, DiceDominoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceDominoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceDominoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDominoPlugin: GamePlugin<DiceDominoState, DiceDominoAction, typeof settings> = {
  id:"dice-domino", title:"Dice Domino", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Match your dice roll to a target domino. 10 rounds, full or partial credit.",
  howToPlay:`Dice Domino is a luck-based dice matching game. Each round, a target domino is shown — two random dice values from 1 to 6. You then roll your own pair of dice. Match both target values (in either order) and you score 20 points. Match one of them and you score 5 points. Match neither and you score zero.

You play 10 rounds, with a maximum possible score of 200 points (10 × 20).

Probability tip: matching a single specific value with one of two dice rolls is about 31% (1 - (5/6)²). The chance of matching both target values exactly is roughly 5.5% (a bit higher than 1/36 because order doesn't matter and identical pairs reduce slightly). So most rounds you'll either get nothing or 5 points.

Average expected score is around 30-50 points across the 10 rounds, with lucky games hitting 100+ when those perfect matches stack up. Tap Roll, hold your breath, and hope the dominoes align!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDominoSettings),
  reducer,
  isTerminal,
  hint: (state: DiceDominoState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-dice-domino-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-domino-next"]', pulses: 3 };
    return null;
  },
  component:DiceDominoGame,
};
