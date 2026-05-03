import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LobsterGrabState, LobsterGrabAction, LobsterGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LobsterGrabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LobsterGrabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lobsterGrabPlugin: GamePlugin<LobsterGrabState, LobsterGrabAction, typeof settings> = {
  id:"lobster-grab", title:"Lobster Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab lobsters at the right speed — match target power for big scores!",
  howToPlay:`Lobster Grab is a speed-precision arcade game. Each round a hidden target power determines ideal grab speed. Set the slider and press Grab! Points are based on proximity to target up to 100 per round. Ten rounds, 1000 max. Use diff feedback to calibrate. The closer you get every round, the bigger your final score. Become the ultimate lobster wrangler!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LobsterGrabSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-lobster-grab-action"]', pulses: 3 }; },
  component:LobsterGrabGame,
};
