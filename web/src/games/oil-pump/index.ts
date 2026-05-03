import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OilPumpState, OilPumpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OilPump = /* @__PURE__ */ lazy(() => import("./OilPump.js").then((mod) => ({ default: mod.OilPump as unknown as React.ComponentType<unknown> })));
export const oilPumpSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof oilPumpSettings>;
export const oilPumpPlugin:GamePlugin<OilPumpState,OilPumpAction,typeof oilPumpSettings> = {
  id:"oil-pump",title:"Oil Pump",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to pump oil and score points each round.",
  howToPlay:`Oil Pump is a press-based arcade game. Each round an oil pump needs a set number of pumps to fill a barrel. Watch the pump counter and tap the button until you reach the target. Filling a barrel earns 10 points. A new barrel with a fresh pump target is set each round. Play 5, 10, or 15 rounds. Tips: Barrels need 3 to 8 pumps depending on their size. Count carefully and stop at the target exactly. Rhythmic consistent pumping beats erratic fast clicking. Each pump brings you closer to striking oil — keep the pressure steady and watch the counter.`,
  settings:oilPumpSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-oil-pump-action"]', pulses: 3 }; },
  component:OilPump,
};
