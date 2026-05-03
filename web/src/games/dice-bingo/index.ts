import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBingoState, DiceBingoAction, DiceBingoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBingoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBingoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBingoPlugin: GamePlugin<DiceBingoState, DiceBingoAction, typeof settings> = {
  id:"dice-bingo", title:"Dice Bingo", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"5x5 bingo card filled with dice values 1-6. Roll, mark, complete lines for big bonuses.",
  howToPlay:`Dice Bingo is a 25-round dice-bingo hybrid. At the start, a 5x5 grid is filled with random dice values 1 through 6. Each round you roll a single die, then click any matching unmarked cell to mark it. Each match earns +5, and completing a row, column, or diagonal triggers a +50 line bonus.

If your roll has no available match (rare but possible toward the end), press Skip. The round ends without scoring.

Strategy: with 25 cells, 25 rolls, and only six possible values, you will see plenty of duplicates. Try to mark cells that contribute to multiple potential lines (especially the center, which lies on a row, column, and both diagonals). The center is gold!

A clean game with all 25 squares marked plus all 12 lines (5 rows + 5 cols + 2 diagonals) would yield 125 + 600 = 725 points. Realistic scores are around 200-300.

Roll, mark, line — bingo!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBingoSettings),
  reducer,
  isTerminal,
  hint: (state: DiceBingoState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-bingo-roll"]', pulses: 3 };
    return null;
  },
  component:DiceBingoGame,
};
