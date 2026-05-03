import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagpieTaflState, MagpieTaflAction, MagpieTaflSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MagpieTaflGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagpieTaflGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const magpieTaflPlugin: GamePlugin<MagpieTaflState, MagpieTaflAction, typeof settings> = {
  id:"magpie-tafl", title:"Magpie Tafl", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Modern simplified Tafl on 5x5. Place vs random CPU; most pieces wins.",
  howToPlay:"Magpie Tafl is a modern simplified Tafl on a 5×5 (or 7×7 in original) board, designed to be approachable while preserving the essential Tafl asymmetric feel. This compact version reframes it as a placement contest: you and a random CPU alternate placing pieces across 14 total moves.\n\nClick any empty cell to place your piece; the CPU follows with a random placement. Game ends after 14 moves or when the board (25 cells) fills. Most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. The CPU's random play means you can usually steer the board toward your favored zones — the corners and center are traditionally strong.\n\nMagpie Tafl was created as an introductory Tafl variant for newcomers. This implementation strips it further to pure placement strategy, making for fast games that still reward careful spatial thinking.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MagpieTaflSettings),
  reducer,isTerminal,component:MagpieTaflGame,
};
