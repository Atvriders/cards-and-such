import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LasagnaLayerState, LasagnaLayerAction, LasagnaLayerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LasagnaLayerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LasagnaLayerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lasagnaLayerPlugin: GamePlugin<LasagnaLayerState, LasagnaLayerAction, typeof settings> = {
  id:"lasagna-layer", title:"Lasagna Layer", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Layer lasagna sheets at the perfect power for top scores!",
  howToPlay:`Lasagna Layer challenges you to lay each pasta sheet at the ideal thickness. A hidden target power is set each round. Use the slider then press Layer! to lay it. Points depend on closeness to target — up to 100 per round. Ten rounds, max 1000 total. Adjust using the post-round diff feedback. Perfect layers score 100; large misses score low. Aim for a perfect 1000!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LasagnaLayerSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-lasagna-layer-action"]', pulses: 3 }; },
  component:LasagnaLayerGame,
};
