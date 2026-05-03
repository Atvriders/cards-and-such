import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SalamiSliceState, SalamiSliceAction, SalamiSliceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SalamiSliceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SalamiSliceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const salamiSlicePlugin: GamePlugin<SalamiSliceState, SalamiSliceAction, typeof settings> = {
  id:"salami-slice", title:"Salami Slice", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Slice salamis by hovering or clicking. 30-second arcade slicer.",
  howToPlay:`Salami Slice is a 30-second clicker with a hover-blade twist: drag your cursor across each salami to slice it, or just tap directly. Either way scores 10 points per slice. The board has six lanes, and salamis appear in random positions.

The game ticks roughly once per second, spawning new salamis. Each lingers for a few ticks before vanishing — slip a salami and you've lost the point. Because hover triggers a slice on desktop, you can carve through a row by sweeping smoothly across the board, picking up any salamis your cursor crosses. Touch users tap each one individually.

There's no skill ceiling: the more salamis you slice in 30 seconds, the higher your final score. Average runs land around 250 points; deli-fast hands can clear 500+. The clock counts down in the top right; when it hits zero, the slicer stops and your final score locks in.

Sharpen your blade — these salamis are slippery!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SalamiSliceSettings),
  reducer,isTerminal,
  hint: (state: SalamiSliceState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.salamis || state.salamis.length === 0) return null;
    return { selector: '[data-testid="hint-target-salami-slice-target"]', pulses: 3 };
  },
  component:SalamiSliceGame,
};
