import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NoodleGrabState, NoodleGrabAction, NoodleGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NoodleGrabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NoodleGrabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const noodleGrabPlugin: GamePlugin<NoodleGrabState, NoodleGrabAction, typeof settings> = {
  id:"noodle-grab", title:"Noodle Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab noodles from the pot at exactly the right speed for top scores!",
  howToPlay:`Noodle Grab is a speed-precision food arcade game. Each round grab noodles from the pot at the exact right speed — determined by the round's hidden target. Set the slider and press Grab! The closer your power matches the target, the more points up to 100 per round. Ten rounds of noodle-grabbing action. Check your diff after each round and calibrate. A flawless 1000-point run means you grabbed every batch perfectly!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NoodleGrabSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-noodle-grab-action"]', pulses: 3 }; },
  component:NoodleGrabGame,
};
