import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniWarState, MiniWarAction, MiniWarSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniWarGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniWarGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniWarPlugin: GamePlugin<MiniWarState, MiniWarAction, typeof settings> = {
  id:"mini-war", title:"Mini War", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"You vs the CPU: high card wins each battle. 12 battles, no skill, all luck.",
  howToPlay:`Mini War is a luck-only card duel based on the classic kids' game of the same name. Each battle, you and the CPU each draw one card from a shared 52-card deck. Whoever has the higher rank wins the battle.

Card ranks: 2 (low) through Ace (high). Suits don't matter. Ties happen when both cards have equal rank.

Scoring per battle: win earns 10 points; tie earns 3 points (consolation, no actual war/replay); loss earns 0 points.

There are twelve battles total. Press Battle to draw the next pair, see the result, then Next to continue. Average expected score is around 60 points (you win about half, tie a few, lose the rest). Hot streaks of 7+ wins push past 80.

Mini War is pure entertainment — no decisions to make, just watch the cards land. Good for a quick game while waiting for coffee.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniWarSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "war") return { selector: '[data-testid="hint-target-mini-war-battle"]', pulses: 3 };
    if (state.phase === "reveal") return { selector: '[data-testid="hint-target-mini-war-next"]', pulses: 3 };
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-mini-war-flip"]', pulses: 3 };
    return null;
  },component:MiniWarGame,
};
