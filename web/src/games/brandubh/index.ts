import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BrandubhState, BrandubhAction, BrandubhSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BrandubhGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BrandubhGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const brandubhPlugin: GamePlugin<BrandubhState, BrandubhAction, typeof settings> = {
  id:"brandubh", title:"Brandubh", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Irish 5x5 Tafl variant. Place vs random CPU; most pieces wins.",
  howToPlay:"Brandubh is an Irish Tafl-family game played on a 5×5 board, traditionally an asymmetric king-vs-attackers race. This compact version reframes the gameplay as a placement contest: you and a random CPU take turns placing pieces on empty cells across 14 total moves (7 per side).\n\nClick any empty cell to place your piece. The CPU then places a piece in a random empty cell. The game ends when 14 moves have been made, or the 5×5 board (25 cells) fills up — whichever comes first. The player with the most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. Since you and the CPU place equal counts under move-cap rules, the game more often draws — but the CPU sometimes self-blocks, giving you placement advantages. Aim to deny the CPU's potential lines and claim the corners (the traditional Brandubh \"throne corners\").\n\nQuick, classic Celtic strategy in compact form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BrandubhSettings),
  reducer,isTerminal,component:BrandubhGame,
};
