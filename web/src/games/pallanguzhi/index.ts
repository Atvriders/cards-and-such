import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PallanguzhiState, PallanguzhiAction, PallanguzhiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PallanguzhiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PallanguzhiGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pallanguzhiPlugin: GamePlugin<PallanguzhiState, PallanguzhiAction, typeof settings> = {
  id:"pallanguzhi", title:"Pallanguzhi", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tamil mancala simplified. Place vs random CPU on 4x4 grid; most pieces wins.",
  howToPlay:"Pallanguzhi is a traditional Tamil mancala game played in a 2×7 (sometimes 2×14) array of pits with cowries or seeds. This drastically simplified 4×4 placement adaptation reframes the gameplay where you and a random CPU alternate placing stones on empty squares.\n\nClick any empty cell to place your stone. The CPU then places randomly. The game runs up to 14 moves (7 each) or until the 16-square board fills. Most stones on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. With near-equal placements both ways, draws are common — but the CPU's random play sometimes self-blocks, giving you placement edges. Center and corner cells tend to be valuable.\n\nThe full Pallanguzhi has rich sowing-and-capture mechanics; this is a simplified essence-capture. For the complete experience seek out a traditional pallanguzhi board — but for a quick fix this tribute will scratch the itch.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PallanguzhiSettings),
  reducer,isTerminal,hint: (state: PallanguzhiState): HintTarget | null => state.phase === "playing" ? { selector: '.pg-board', pulses: 3 } : null, component:PallanguzhiGame,
};
