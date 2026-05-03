import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PonnukiState, PonnukiAction, PonnukiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PonnukiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PonnukiGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ponnukiPlugin: GamePlugin<PonnukiState, PonnukiAction, typeof settings> = {
  id:"ponnuki", title:"Ponnuki", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Small-capture Go variant. Place vs random CPU on 4x4. Most pieces wins.",
  howToPlay:"Ponnuki is a Go term for a \"diamond formation\" of four stones surrounding a single point — and a small-capture Go variant where you aim to make this shape. This compact 4×4 board version reframes the gameplay as a placement contest.\n\nYou and a random CPU alternate placing stones on empty intersections. Click any empty cell to place. The CPU then plays randomly. After 12 moves or when the 16-square board fills, most stones on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. With only 16 cells and 12 moves, both sides place equal counts in most games — but the CPU sometimes self-blocks, giving you placement advantages. The corners and center positions tend to dominate in 4×4.\n\nA tiny Go-flavored experience. The full Ponnuki shape — four stones around a center — is more reliable to form here than on a 19×19 board, capturing the elegance of the original concept.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PonnukiSettings),
  reducer,isTerminal,component:PonnukiGame,
};
