import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreesPuzzleState, ThreesPuzzleAction, ThreesPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ThreesPuzzleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ThreesPuzzleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const threesPuzzlePlugin: GamePlugin<ThreesPuzzleState, ThreesPuzzleAction, typeof settings> = {
  id:"threes-puzzle", title:"Threes Puzzle", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Number-matching puzzle inspired by Threes.",
  howToPlay:"Threes Puzzle is a sixty-second number-matching match-three inspired by the famous Threes mobile classic. The six-by-six grid is filled with numbered tiles. Click two adjacent tiles to swap them; whenever the swap creates a horizontal or vertical run of three or more matching numbers, those tiles clear for ten points each. New numbered tiles fall in from above and often trigger cascade chains for bonus points. Invalid swaps simply cancel. The six different number tiles give plenty of strategic options — three-in-a-row with the same number scores baseline, while clever cascade setups can clear large groups for big bonuses. The clock counts down sixty seconds at the top of the screen. Average runs net 280-380 points. Number-puzzle savants chasing four- and five-in-a-row regularly score over 500. When the timer expires, your final score locks in. Combine, cascade, and chase the threes!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThreesPuzzleSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-threes-puzzle-action"]', pulses: 3 }; },
  component:ThreesPuzzleGame,
};
