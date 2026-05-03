import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrappeFlipState, FrappeFlipAction, FrappeFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FrappeFlipGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FrappeFlipGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const frappeFlipPlugin: GamePlugin<FrappeFlipState, FrappeFlipAction, typeof settings> = {
  id:"frappe-flip", title:"Frappe Flip", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Flip frappes by clicking. 25s clicker.",
  howToPlay:"Frappe Flip is a 25-second frappe-flipping mini. Frappe glasses drift in six lanes; click each one to flip and score 10 points. Frappes only last a few ticks before they melt away — flip them while they're cold!\n\nThe board fills with new frappes every tick (about once per second). It is pure reaction-time arcade — no upgrades, no power-ups, just fast taps. Average runs land at around 180–260 points. The very best clickers can break 350.\n\nThe timer in the top right counts down from 25 seconds — slightly tighter than a typical clicker, so play with focus. Flip frappes left and right and don't blink. When the clock hits zero, your final tally is locked in. Build that top-shelf chill score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FrappeFlipSettings),
  reducer,isTerminal,
  hint: (state: FrappeFlipState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-frappe-flip-target"]', pulses: 3 };
  },
  component:FrappeFlipGame,
};
