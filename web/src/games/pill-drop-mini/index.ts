import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PillDropMiniState, PillDropMiniAction, PillDropMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PillDropMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pillDropMiniPlugin: GamePlugin<PillDropMiniState, PillDropMiniAction, typeof settings> = {
  id:"pill-drop-mini", title:"Pill Drop Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pill-and-virus match-3 inspired by classic puzzlers.",
  howToPlay:"Pill Drop Mini is a sixty-second match-three inspired by classic pill-and-virus puzzlers. The six-by-six grid is filled with colored pills and viruses. Click adjacent cells to swap them. Whenever a swap creates a horizontal or vertical run of three or more matching colors, those cells clear for ten points each, and new pieces fall in from above to refill the board. Cascade chains are very common with only four colors in play, so a single swap can trigger several rounds of automatic clears for bonus points. Invalid swaps cancel without penalty. The four-color palette makes matches plentiful but the play is fast — strategy lies in setting up cascades. The clock counts down sixty seconds at the top. Average scores hover around 350-450 due to the dense match probability; cascade specialists clear 600+. Time's up — final score locks. Pop those pills!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PillDropMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pill-drop-mini-action"]', pulses: 3 }; }, component:PillDropMiniGame,
};
