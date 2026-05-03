import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniMexicanState, MiniMexicanAction, MiniMexicanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniMexicanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniMexicanGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniMexicanPlugin: GamePlugin<MiniMexicanState, MiniMexicanAction, typeof settings> = {
  id:"mini-mexican", title:"Mini Mexican", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two-dice gambling-style scoring: 2-1 Mexican, doubles, or two-digit pair value. 8 rounds.",
  howToPlay:`Mini Mexican is a barfly-style two-dice scoring game inspired by the classic drinking game Mexican. Each round you roll two dice, and the result is scored using a strict precedence:

A roll of 2-1 (in any order) is the namesake "Mexican" — worth 100 points. Doubles (1-1, 2-2, ... 6-6) score a flat 50 points. Anything else is treated as a two-digit number, high die first, low die second: a 6-3 scores 63, a 4-2 scores 42, and so on, capping at 65 for a 6-5 (the highest non-double, non-Mexican).

There are eight rounds, and they're independent — no carryovers, no chains. Press Roll, see the result, press Next.

Average expected score lands around 30-40 per round, so total runs in the 250-350 range. A single Mexican alone changes the math; doubles are nice but not amazing. Pure luck — no strategy required.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniMexicanSettings),
  reducer,isTerminal,
  hint: (state: MiniMexicanState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-mini-mexican-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-mini-mexican-next"]', pulses: 3 };
    return null;
  },
  component:MiniMexicanGame,
};
