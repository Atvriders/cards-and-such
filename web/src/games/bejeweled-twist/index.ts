import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BejeweledTwistState, BejeweledTwistAction, BejeweledTwistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BejeweledTwistGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BejeweledTwistGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bejeweledTwistPlugin: GamePlugin<BejeweledTwistState, BejeweledTwistAction, typeof settings> = {
  id:"bejeweled-twist", title:"Bejeweled Twist", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Twist-and-match gem puzzle with 60-second clock.",
  howToPlay:"Bejeweled Twist is a 60-second twist on classic match-three. The six-by-six grid is filled with vibrantly colored gems. Click adjacent gems to swap them; whenever the swap creates a row or column of three or more identical gems, that group is cleared for ten points each, with new gems falling from above to fill the gaps. Lucky chains will trigger cascading clears worth massive bonus points. Unlike vanilla Bejeweled, the focus here is on speed — you only have one minute, so quick pattern recognition matters more than perfect optimization. Aim for adjacent triples first; they keep the board churning and increase the odds of cascade chains. The timer ticks down in the top-right. When it hits zero, the board freezes and your score is final. Average scores fall around 250-350; twist masters routinely top 500. Spin those gems!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BejeweledTwistSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-bejeweled-twist-action"]', pulses: 3 }; },
  component:BejeweledTwistGame,
};
