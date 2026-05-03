import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Game1024State, Game1024Action, Game1024Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game1024Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const game1024Plugin: GamePlugin<Game1024State, Game1024Action, typeof settings> = {
  id:"game-1024", title:"1024 Match", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Simpler-paced power-of-two match-3 sprint.",
  howToPlay:"1024 Match is a sixty-second match-three sprint, a slightly simpler-paced cousin of 2048 Match. The six-by-six grid is filled with five power-of-two themed tiles. Click adjacent tiles to swap them. Whenever a swap creates a horizontal or vertical run of three or more matching tiles, those tiles clear for ten points each. New tiles fall in from above and often trigger cascade chains for huge bonus points. Invalid swaps cancel without using a turn. With one fewer symbol than 2048 Match, matches form more quickly here, making this an excellent intro for newcomers to the match-three genre. The clock counts down sixty seconds at the top. Average runs net 320-420 points thanks to the dense match probability; cascade-chasers easily score above 500. When the timer expires, the board freezes and your final score is locked in. Smaller numbers, bigger combos, just as much fun!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Game1024Settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-game-1024-action"]', pulses: 3 }; },
  component:Game1024Game,
};
