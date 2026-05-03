import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SamegameMiniState, SamegameMiniAction, SamegameMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SamegameMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const samegameMiniPlugin: GamePlugin<SamegameMiniState, SamegameMiniAction, typeof settings> = {
  id:"samegame-mini", title:"SameGame Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Classic SameGame match-3 with a 60-second twist.",
  howToPlay:"SameGame Mini is a sixty-second match-three based on the classic SameGame block-removal puzzle. The six-by-six grid is filled with colored balls in five vibrant colors. Click two adjacent balls to swap them; if the swap creates a horizontal or vertical run of three or more matching balls, those balls clear for ten points each. New balls fall in from above to refill the board, often triggering big cascade chains. Invalid swaps cancel without using a turn. The original SameGame removed groups of any size; this match-three variant keeps the iconic five-color palette while adopting fast match-three mechanics. With only five colors, matches form quickly and cascades pile up for bonus points. The clock counts down sixty seconds at the top. Average scores: 320-420; SameGame veterans top 500 chasing cascades. When the timer hits zero, your final score locks in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SamegameMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-samegame-mini-action"]', pulses: 3 }; }, component:SamegameMiniGame,
};
