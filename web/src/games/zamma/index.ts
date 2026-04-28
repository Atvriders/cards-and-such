import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZammaState, ZammaAction, ZammaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZammaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const zammaPlugin: GamePlugin<ZammaState, ZammaAction, typeof settings> = {
  id:"zamma", title:"Zamma", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"North African Alquerque cousin. Place vs random CPU; most pieces wins.",
  howToPlay:"Zamma is a North African board game in the Alquerque family, traditionally played on a board with intersecting diagonal lines. This compact 5×5 version reframes it as a placement contest where you and a random CPU alternate placing pieces.\n\nClick any empty cell to place your piece. CPU plays a random empty cell in response. Game runs for up to 16 moves (8 each), ending when 16 moves are reached or the 25-cell board fills. Most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. With the CPU playing randomly you'll often have local placement advantages — exploit tighter lines and don't waste turns. Corners and center are traditionally strong.\n\nZamma roots run deep in Saharan Africa. This simple placement adaptation captures the spatial-strategy essence: see ahead, deny your opponent, claim the most ground.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZammaSettings),
  reducer,isTerminal,component:ZammaGame,
};
