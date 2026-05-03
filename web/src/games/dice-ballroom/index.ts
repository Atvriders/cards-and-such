import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBallroomState, DiceBallroomAction, DiceBallroomSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBallroomGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBallroomGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBallroomPlugin: GamePlugin<DiceBallroomState, DiceBallroomAction, typeof settings> = {
  id:"dice-ballroom", title:"Dice Ballroom", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Waltz, tango, foxtrot — pick a dance and roll the dice.",
  howToPlay:"Dice Ballroom is a tiny dance-floor mini. Each round, you pick a dance step: Waltz (3-step — sum 3, 6, or 9), Tango (passionate — sum 4 or 11), or Foxtrot (slow-quick-quick — sum 5, 7, or 10). The dice are rolled and the dance is judged.\n\nScoring: Waltz (about 28%) pays 18 points, Tango (about 14%) pays 35 points, Foxtrot (about 36%) pays 15 points. Wrong picks score zero. Ten rounds total.\n\nThe Tango pays the most but rolls infrequently — bet it sparingly. Waltz and Foxtrot are bread-and-butter bets. Mix and match like a skilled ballroom dancer; keep your timing right, and the trophy will be yours!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBallroomSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-ballroom-roll"]', pulses: 3 }; },
  component:DiceBallroomGame,
};
