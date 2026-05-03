import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColumnsMiniState, ColumnsMiniAction, ColumnsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColumnsMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const columnsMiniPlugin: GamePlugin<ColumnsMiniState, ColumnsMiniAction, typeof settings> = {
  id:"columns-mini", title:"Columns Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Match-3 inspired by Sega's classic Columns puzzler.",
  howToPlay:"Columns Mini is a sixty-second match-three inspired by Sega's classic 1990 puzzler. The six-by-six grid is filled with colored jewels arranged in random columns. Click adjacent jewels to swap them. Forming a horizontal or vertical run of three or more identical jewels clears them for ten points apiece, and gravity pulls remaining jewels down — often triggering satisfying cascade chains for huge bonus points. Invalid swaps that don't create matches simply cancel without using a turn. The clock counts down sixty seconds at the top of the screen. With six colors, the board offers plenty of strategic options; longer matches of four or five at a time multiply your gains through the cascade engine. Average score: 280-360 points. Cascade hunters regularly clear 500+. When the timer expires, your final score is locked in. Channel your inner Sega arcade kid and chain those columns!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColumnsMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-columns-mini-action"]', pulses: 3 }; }, component:ColumnsMiniGame,
};
