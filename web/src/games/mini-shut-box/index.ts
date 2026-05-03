import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniShutBoxState, MiniShutBoxAction, MiniShutBoxSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniShutBoxGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniShutBoxGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniShutBoxPlugin: GamePlugin<MiniShutBoxState, MiniShutBoxAction, typeof settings> = {
  id:"mini-shut-box", title:"Mini Shut the Box", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Close numbered tiles 1-9 by summing dice rolls. Score 50 minus what's left open.",
  howToPlay:`Mini Shut the Box is a single-player version of the pub classic. Numbers 1 through 9 are open. Each turn, roll two dice and shut any combination of open tiles whose sum equals the dice total.

Example: rolled a 7? Shut 7, or 1+6, or 2+5, or 3+4, or 1+2+4. Tap tiles to select them; the dashboard shows your running selected-sum versus the target. Press Submit when matched.

If you cannot make any combination summing to your roll, the game ends — your score is 50 minus the sum of remaining open numbers (capped at 0). If you shut all nine tiles, you score a perfect 100. Give up at any time to lock in your current partial score.

Strategy: shut the high tiles (7, 8, 9) early when possible — they're worth the most if left open. Sums of 6, 7, and 8 give the most flexibility. With smart play, scores above 35 are achievable; perfect 100s are rare.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniShutBoxSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-mini-shut-box-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mini-shut-box-submit"]', pulses: 3 };
  },
  component:MiniShutBoxGame,
};
